/**
 * @file githubClient.js
 * @description Centralized HTTPS Transport Layer & REST API Client for GitHub API.
 * Communicates strictly with https://api.github.com, enforces authorization check per request,
 * fetches PAT only from githubAuthService.getToken(), parses rate-limits, handles 10s timeouts,
 * applies bounded retries for transient errors, and scrubs all credentials from audit events & errors.
 */

import { githubAuthService } from "./githubAuthService.js";
import { hasPermission } from "../auth/authorization.js";
import { logAuditEvent, AUDIT_EVENTS } from "../auth/auditLogger.js";
import { RUNTIME_ERROR_CODES, createRuntimeError } from "../runtime/runtimeErrors.js";
import { redactSecrets } from "../runtime/runtimeProtocol.js";

const GITHUB_API_BASE_URL = "https://api.github.com";
const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

export class GithubClient {
  /**
   * Helper to parse rate limit headers
   * @param {Headers|Object} headers
   * @returns {{ limit: number|null, remaining: number|null, resetAt: string|null }}
   */
  _parseRateLimitHeaders(headers) {
    if (!headers) return { limit: null, remaining: null, resetAt: null };
    const getHeader = (name) => {
      if (typeof headers.get === "function") return headers.get(name);
      return headers[name] || headers[name.toLowerCase()] || null;
    };

    const limit = getHeader("x-ratelimit-limit");
    const remaining = getHeader("x-ratelimit-remaining");
    const reset = getHeader("x-ratelimit-reset");

    return {
      limit: limit !== null && limit !== undefined ? Number(limit) : null,
      remaining: remaining !== null && remaining !== undefined ? Number(remaining) : null,
      resetAt: reset ? new Date(Number(reset) * 1000).toISOString() : null,
    };
  }

  /**
   * Validate endpoint path safety
   * @param {string} endpoint
   * @returns {string} Clean endpoint path starting with '/'
   */
  _validateEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== "string") {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Invalid endpoint. Endpoints must be non-empty strings.",
        "github.request"
      );
    }

    const trimmed = endpoint.trim();
    if (/^(https?:|file:|data:|javascript:|\/\/)/i.test(trimmed)) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Security boundary violation: Arbitrary external host URLs are prohibited in GitHub client endpoints.",
        "github.request"
      );
    }

    if (!trimmed.startsWith("/")) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Invalid endpoint. Endpoints must be relative paths starting with '/' (e.g. '/user' or '/repos/owner/repo')",
        "github.request"
      );
    }

    return trimmed;
  }

  /**
   * Execute an authenticated GitHub API HTTP request
   * @param {string} endpoint - Relative path (e.g. '/user' or '/repos/owner/repo')
   * @param {Object} options
   * @param {string} [options.method="GET"]
   * @param {any} [options.body]
   * @param {Object} [options.headers]
   * @param {Object} [options.query]
   * @param {string} options.requiredPermission - Permission constant from PERMISSIONS
   * @param {Function} [options.fetchImpl=globalThis.fetch]
   * @param {number} [options.timeoutMs=10000]
   * @param {boolean} [options.skipRetry=false]
   * @param {Object} user - Application user identity
   * @returns {Promise<Object>} Safe response container { data, status, rateLimit }
   */
  async request(endpoint, options = {}, user = null) {
    const method = (options.method || "GET").toUpperCase();
    const cleanEndpoint = this._validateEndpoint(endpoint);

    // 1. Authorization Gate
    if (!user || !options.requiredPermission || !hasPermission(user, options.requiredPermission)) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        `User identity missing or lacks required permission '${options.requiredPermission || "unknown"}'`,
        "github.request"
      );
      logAuditEvent(AUDIT_EVENTS.PERMISSION_DENIED, { operation: "github.request", endpoint: cleanEndpoint }, user);
      throw err;
    }

    // 2. Token Check
    const token = githubAuthService.getToken();
    if (!token) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHENTICATION_FAILURE,
        "GitHub session is not connected. Authenticate with a PAT first.",
        "github.request"
      );
      throw err;
    }

    // 3. Construct URL & Query String
    let fullUrl = `${GITHUB_API_BASE_URL}${cleanEndpoint}`;
    if (options.query && typeof options.query === "object" && Object.keys(options.query).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      }
      fullUrl += `?${searchParams.toString()}`;
    }

    const fetchImpl = options.fetchImpl || globalThis.fetch;
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const maxAttempts = options.skipRetry ? 1 : (MAX_RETRIES + 1);

    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

      try {
        const reqHeaders = {
          Accept: "application/vnd.github+json",
          Authorization: `token ${token.trim()}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "AI-Engineer-OS-Client/1.6",
          ...(options.headers || {}),
        };

        if (options.body && method !== "GET" && method !== "HEAD") {
          reqHeaders["Content-Type"] = "application/json";
        }

        const fetchOptions = {
          method,
          headers: reqHeaders,
          body: options.body && typeof options.body === "object" ? JSON.stringify(options.body) : options.body,
          signal: controller ? controller.signal : undefined,
        };

        const response = await fetchImpl(fullUrl, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);

        const rateLimit = this._parseRateLimitHeaders(response.headers);
        const status = response.status;

        // Handle HTTP Statuses
        if (!response.ok) {
          let errText = "";
          try {
            errText = await response.text();
          } catch {
            // ignore
          }

          const redactedErrText = redactSecrets(errText);

          // Bounded retry logic for 502, 503, 504
          if (attempt < maxAttempts && (status === 502 || status === 503 || status === 504)) {
            await new Promise((r) => setTimeout(r, attempt * 50));
            continue;
          }

          // Map HTTP status codes to RuntimeError
          let errorCode = RUNTIME_ERROR_CODES.UNKNOWN_ERROR;
          let errorMessage = `GitHub API request failed with HTTP ${status}`;

          if (status === 401) {
            errorCode = RUNTIME_ERROR_CODES.AUTHENTICATION_FAILURE;
            errorMessage = "GitHub API Bad credentials (401)";
          } else if (status === 403 || status === 429) {
            errorCode = RUNTIME_ERROR_CODES.COMMAND_BLOCKED;
            errorMessage = rateLimit.remaining === 0 ? "GitHub API rate limit exceeded" : "GitHub API request forbidden (403)";
          } else if (status === 404) {
            errorCode = RUNTIME_ERROR_CODES.INVALID_REQUEST;
            errorMessage = "GitHub API resource not found (404)";
          } else if (status === 409) {
            errorCode = RUNTIME_ERROR_CODES.INVALID_OPERATION;
            errorMessage = "GitHub API conflict state (409)";
          } else if (status === 422) {
            errorCode = RUNTIME_ERROR_CODES.INVALID_REQUEST;
            errorMessage = `GitHub API validation failed (422): ${redactedErrText.substring(0, 100)}`;
          } else if (status >= 500) {
            errorCode = RUNTIME_ERROR_CODES.RUNTIME_UNAVAILABLE;
            errorMessage = `GitHub server error (${status})`;
          }

          const errorObj = createRuntimeError(errorCode, errorMessage, "github.request", {
            status,
            endpoint: cleanEndpoint,
            rateLimit,
          });

          logAuditEvent(
            AUDIT_EVENTS.GITHUB_ACTION,
            { action: "api_failure", endpoint: cleanEndpoint, status, errorCode },
            user
          );

          throw errorObj;
        }

        // Parse response data safely
        let data = null;
        if (status !== 204) {
          const contentType = typeof response.headers?.get === "function" ? response.headers.get("content-type") : "";
          if (contentType && contentType.includes("application/json")) {
            try {
              data = await response.json();
            } catch {
              data = null;
            }
          } else {
            try {
              const textData = await response.text();
              data = redactSecrets(textData);
            } catch {
              data = null;
            }
          }
        }

        logAuditEvent(
          AUDIT_EVENTS.GITHUB_ACTION,
          { action: "api_success", endpoint: cleanEndpoint, status, attempts: attempt },
          user
        );

        return {
          status,
          data,
          rateLimit,
        };
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);

        // Abort / Timeout check
        if (err?.name === "AbortError") {
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, attempt * 50));
            continue;
          }
          const timeoutErr = createRuntimeError(
            RUNTIME_ERROR_CODES.TIMEOUT,
            `GitHub API request to '${cleanEndpoint}' timed out after ${timeoutMs}ms`,
            "github.request"
          );
          logAuditEvent(AUDIT_EVENTS.GITHUB_ACTION, { action: "api_timeout", endpoint: cleanEndpoint }, user);
          throw timeoutErr;
        }

        if (err && err.name === "RuntimeError") {
          throw err;
        }

        // Transient network error retry
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, attempt * 50));
          continue;
        }

        const netErr = createRuntimeError(
          RUNTIME_ERROR_CODES.RUNTIME_UNAVAILABLE,
          redactSecrets(err?.message || "GitHub API network error"),
          "github.request"
        );
        logAuditEvent(AUDIT_EVENTS.GITHUB_ACTION, { action: "api_network_failure", endpoint: cleanEndpoint }, user);
        throw netErr;
      }
    }

    throw createRuntimeError(RUNTIME_ERROR_CODES.UNKNOWN_ERROR, "GitHub request failed after retries", "github.request");
  }
}

export const githubClient = new GithubClient();
export default githubClient;
