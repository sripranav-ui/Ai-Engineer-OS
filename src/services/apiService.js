import logger from "../utils/logger";

const BASE_URL = "/api/v1";

/**
 * Generic Mock API Client wrapper (Simulating async requests)
 */
export const apiService = {
  /**
   * Safe request dispatcher resolving mock promise latencies
   */
  request: async (method, path, body = null, headers = {}) => {
    logger.info(`[API Request] ${method.toUpperCase()} ${BASE_URL}${path}`, body ? { body } : "");
    
    // Simulate server network latency
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Enforce mock mock success outputs
        const mockResponse = {
          status: 200,
          data: body ? { ...body, id: Math.round(Math.random() * 1000) } : { success: true },
        };
        logger.info(`[API Response] ${method.toUpperCase()} ${path} -> Status ${mockResponse.status}`);
        resolve(mockResponse.data);
      }, 500);
    });
  },

  get: async (path, headers) => apiService.request("get", path, null, headers),
  post: async (path, body, headers) => apiService.request("post", path, body, headers),
  put: async (path, body, headers) => apiService.request("put", path, body, headers),
  delete: async (path, headers) => apiService.request("delete", path, null, headers),
};

export default apiService;
