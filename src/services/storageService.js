import logger from "../utils/logger.js";

// Standard fallback memory storage
const memoryStorage = {};

/**
 * Safe Browser Persistence Services
 */
export const storageService = {
  /**
   * Safe set item to localStorage with Memory Storage Fallback
   */
  set: (key, value) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    } catch (err) {
      logger.warn(`[StorageService] Failed to write to localStorage for key: ${key}. Falling back to memory storage.`, err);
      memoryStorage[key] = value;
    }
  },

  /**
   * Safe get item from localStorage with Memory Storage Fallback
   */
  get: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item !== null ? item : memoryStorage[key] || null;
      }
      return memoryStorage[key] || null;
    } catch (err) {
      logger.warn(`[StorageService] Failed to read from localStorage for key: ${key}. Returning memory fallback.`, err);
      return memoryStorage[key] || null;
    }
  },

  /**
   * Safe remove item from localStorage
   */
  remove: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch (err) {
      logger.warn(`[StorageService] Failed to remove item from localStorage for key: ${key}.`, err);
      delete memoryStorage[key];
    }
  },
};

export default storageService;
