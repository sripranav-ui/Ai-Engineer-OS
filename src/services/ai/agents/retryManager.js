/**
 * @file retryManager.js
 * @description Task retry policy manager enforcing max retry attempts.
 */

import logger from "../../../utils/logger.js";

export const retryManager = {
  /**
   * Executes task with automatic retry policy.
   * @param {Function} taskFn
   * @param {number} [maxRetries=3]
   */
  executeWithRetry: async (taskFn, maxRetries = 3) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        attempt++;
        return await taskFn();
      } catch (err) {
        logger.warn(`[RetryManager] Task attempt ${attempt}/${maxRetries} failed:`, err);
        if (attempt >= maxRetries) throw err;
      }
    }
  },
};

export default retryManager;
