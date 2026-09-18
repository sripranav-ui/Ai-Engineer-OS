/**
 * @file githubAuthService.js
 * @description Secure In-Memory GitHub Authentication & Credential Security Service for AI Engineer OS.
 * Manages GitHub Personal Access Token (PAT) strictly in volatile session memory.
 * PATs are NEVER stored in localStorage, sessionStorage, IndexedDB, cookies, files, or audit logs.
 */

import { hasPermission } from "../auth/authorization.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";
import { logAuditEvent, AUDIT_EVENTS } from "../auth/auditLogger.js";
import { RUNTIME_ERROR_CODES, createRuntimeError } from "../runtime/runtimeErrors.js";
import { redactSecrets } from "../runtime/runtimeProtocol.js";

export class GithubAuthService {
  constructor() {
    /** @private Strictly volatile in-memory session token */
    this._token = null;
    /** @private Safe non-sensitive GitHub profile metadata */
    this._userMetadata = null;
  }

  /**
   * Helper to format safe masked token preview
   * @param {string|null} token
   * @returns {string}
   */
  _maskToken(token) {
    if (!token || typeof token !== "string") return "Not Connected";
    const trimmed = token.trim();
    if (trimmed.length <= 8) return "[REDACTED]";
    const prefix = trimmed.substring(0, 4);
    const suffix = trimmed.substring(trimmed.length - 4);
    return `${prefix}****...****${suffix}`;
  }

  /**
   * Check if authenticated in active memory
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(this._token);
  }

  /**
   * Get safe connection status for display / UI state.
   * NEVER returns raw PAT credential.
   * @returns {{ authenticated: boolean, tokenPresent: boolean, tokenMask: string, githubUser: Object|null }}
   */
  getStatus() {
    return {
      authenticated: this.isAuthenticated(),
      tokenPresent: this.isAuthenticated(),
      tokenMask: this._maskToken(this._token),
      githubUser: this._userMetadata ? { ...this._userMetadata } : null,
    };
  }

  /**
   * Internal getter for trusted API client services
   * @returns {string|null}
   */
  getToken() {
    return this._token;
  }

  /**
   * Validate token against GitHub GET /user endpoint with 10s timeout
   * @param {string} token
   * @param {Object} [fetchImpl=globalThis.fetch]
   * @returns {Promise<Object>} Safe GitHub user metadata
   */
  async validateToken(token, fetchImpl = globalThis.fetch) {
    if (!token || typeof token !== "string" || !token.trim() || token.trim().length < 8) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Invalid GitHub Personal Access Token format",
        "github.validateToken"
      );
    }

    const cleanToken = token.trim();
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;

    try {
      const response = await fetchImpl("https://api.github.com/user", {
        method: "GET",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `token ${cleanToken}`,
          "User-Agent": "AI-Engineer-OS-Daemon/1.6",
        },
        signal: controller ? controller.signal : undefined,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw createRuntimeError(
            RUNTIME_ERROR_CODES.AUTHENTICATION_FAILURE,
            "Bad credentials: GitHub Personal Access Token is invalid or expired",
            "github.validateToken"
          );
        }
        throw createRuntimeError(
          RUNTIME_ERROR_CODES.AUTHENTICATION_FAILURE,
          `GitHub API authentication failed with HTTP status ${response.status}`,
          "github.validateToken",
          { status: response.status }
        );
      }

      const data = await response.json();
      return {
        login: data.login,
        id: data.id,
        name: data.name || data.login,
        avatarUrl: data.avatar_url,
        htmlUrl: data.html_url,
      };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);

      if (err?.name === "AbortError") {
        throw createRuntimeError(
          RUNTIME_ERROR_CODES.TIMEOUT,
          "GitHub authentication request timed out after 10000ms",
          "github.validateToken"
        );
      }

      if (err && err.name === "RuntimeError") {
        throw err;
      }

      const sanitizedMsg = redactSecrets(err?.message || "Network error during GitHub authentication");
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHENTICATION_FAILURE,
        sanitizedMsg,
        "github.validateToken"
      );
    }
  }

  /**
   * Connect and store PAT in volatile memory after authorization and validation
   * @param {string} token
   * @param {Object} user - Application user identity
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async connect(token, user, options = {}) {
    if (!user || !hasPermission(user, PERMISSIONS.CONNECT_GITHUB)) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        "User identity missing or lacks capability permission 'connect_github'",
        "github.connect"
      );
      logAuditEvent(AUDIT_EVENTS.PERMISSION_DENIED, { operation: "github.connect" }, user);
      throw err;
    }

    try {
      const fetchImpl = options.fetchImpl || globalThis.fetch;
      const metadata = await this.validateToken(token, fetchImpl);

      // Single Active Session: overwrite any previous token
      this._token = token.trim();
      this._userMetadata = metadata;

      logAuditEvent(
        AUDIT_EVENTS.GITHUB_ACTION,
        { action: "connected", githubLogin: metadata.login },
        user
      );

      return {
        success: true,
        authenticated: true,
        githubUser: { ...this._userMetadata },
      };
    } catch (err) {
      this._token = null;
      this._userMetadata = null;

      logAuditEvent(
        AUDIT_EVENTS.GITHUB_ACTION,
        { action: "connect_failed", error: redactSecrets(err?.message || "Auth failed") },
        user
      );

      throw err;
    }
  }

  /**
   * Disconnect and clear PAT from memory
   * @param {Object} [user]
   * @returns {Object}
   */
  disconnect(user = null) {
    this._token = null;
    this._userMetadata = null;

    logAuditEvent(
      AUDIT_EVENTS.GITHUB_ACTION,
      { action: "disconnected" },
      user
    );

    return {
      success: true,
      authenticated: false,
    };
  }
}

export const githubAuthService = new GithubAuthService();
export default githubAuthService;
