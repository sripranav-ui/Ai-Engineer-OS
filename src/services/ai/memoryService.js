import logger from "../../utils/logger";

const userMemoryStore = {};

/**
 * Long-Term User Preferences Memory Service
 */
export const memoryService = {
  /**
   * Sets value in contextual preferences database
   */
  set: (key, value) => {
    userMemoryStore[key] = value;
    logger.info(`[MemoryService] User memory updated for "${key}"`);
  },

  /**
   * Reads value from preferences database
   */
  get: (key, defaultValue = null) => {
    return userMemoryStore[key] !== undefined ? userMemoryStore[key] : defaultValue;
  },

  /**
   * Purges user memory store
   */
  clearAll: () => {
    Object.keys(userMemoryStore).forEach((key) => {
      delete userMemoryStore[key];
    });
    logger.info("[MemoryService] Long-term user memories cleared.");
  }
};

export default memoryService;
