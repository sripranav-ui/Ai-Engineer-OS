import logger from "../utils/logger";
import env from "../config/env";
import mockServer from "./mockServer";
import { ApiError, AuthError, NetworkError, UnknownError } from "./errorHandler";
import monitoringService from "./monitoringService";

/**
 * Enterprise API Client Implementation
 * Leverages request/response interceptors, auto-retry mechanisms, and centralized error classification.
 */
export const apiClient = {
  /**
   * Universal fetch runner executing interceptors and retry handlers
   */
  request: async (endpoint, options = {}, attempt = 1) => {
    const method = options.method || "GET";
    
    // --- 1. Request Interceptors ---
    const interceptedConfig = apiClient.requestInterceptor({
      endpoint,
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      body: options.body
    });

    const startTime = performance.now();
    monitoringService.api(`Request [Attempt ${attempt}]: ${interceptedConfig.method} ${interceptedConfig.endpoint}`);

    try {
      // Execute simulated fetch with request timeout
      const responsePromise = mockServer.handleRequest(
        interceptedConfig.endpoint,
        interceptedConfig.method,
        interceptedConfig.body,
        interceptedConfig.headers
      );

      // Timeout wrapper
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new NetworkError("Request Timeout exceeded.")), env.API_TIMEOUT)
      );

      const response = await Promise.race([responsePromise, timeoutPromise]);
      const duration = performance.now() - startTime;
      
      monitoringService.perf(`API Response Latency: ${duration.toFixed(1)}ms for ${interceptedConfig.method} ${interceptedConfig.endpoint}`);

      // --- 2. Response Interceptors & Error Handlers ---
      return apiClient.responseInterceptor(response);
    } catch (err) {
      monitoringService.error(`API Client Failure: ${err.message} on ${interceptedConfig.method} ${interceptedConfig.endpoint}`, { error: err });

      // --- 3. Retry Handler on connection drops ---
      const shouldRetry = (err instanceof NetworkError || err.status >= 500) && attempt < env.MAX_RETRY_ATTEMPTS;
      if (shouldRetry) {
        const backoffDelay = Math.pow(2, attempt) * 150; // Exponential backoff sleep
        logger.warn(`[API Client] 🔄 Request failed. Retrying in ${backoffDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        return apiClient.request(endpoint, options, attempt + 1);
      }

      // Convert unexpected runtime errors to standard UnknownError
      if (!err.name || err.name === "Error") {
        throw new UnknownError(err.message, err);
      }
      throw err;
    }
  },

  /**
   * Request Interceptor
   */
  requestInterceptor: (config) => {
    // Inject Authorization tokens if present in local state
    const token = localStorage.getItem("auth_access_token") || "mock-jwt-credential-token";
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Inject custom workspace session headers
    const workspaceId = localStorage.getItem("active_workspace_id") || "default";
    config.headers["X-Workspace-Id"] = workspaceId;

    return config;
  },

  /**
   * Response Interceptor
   */
  responseInterceptor: (response) => {
    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthError("Session expired or unauthorized credentials.", "UNAUTHORIZED");
      }
      if (response.status === 403) {
        throw new ApiError("Insufficient permission levels to access resource.", 403);
      }
      throw new ApiError(response.statusText || "Request failed.", response.status, response.data);
    }

    return response.data;
  },

  get: (endpoint, options = {}) => apiClient.request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) => apiClient.request(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) => apiClient.request(endpoint, { ...options, method: "PUT", body }),
  delete: (endpoint, options = {}) => apiClient.request(endpoint, { ...options, method: "DELETE" })
};

export default apiClient;
