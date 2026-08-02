/**
 * Environment Configuration Settings
 * Maps environment variables for API endpoints, timeouts, retries, and execution contexts.
 */
export const env = {
  NODE_ENV: import.meta.env.MODE || "development",
  API_URL: import.meta.env.VITE_API_URL || "https://api.ai-engineer-os.local/v1",
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 10000,
  MAX_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_RETRIES, 10) || 3,
  ENABLE_MOCK_SERVER: import.meta.env.VITE_ENABLE_MOCKS !== "false" // default to true for preview
};

export default env;
