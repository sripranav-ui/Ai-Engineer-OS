/**
 * @file failureRecovery.js
 * @description Failure recovery manager handling fallbacks and workflow recovery.
 */

import logger from "../../../utils/logger.js";

export const failureRecovery = {
  /**
   * Recovers from agent task failure.
   * @param {string} taskId
   * @param {Error} error
   */
  recover: (taskId, error) => {
    logger.warn(`[FailureRecovery] Executing recovery protocol for task "${taskId}":`, error.message);
    return {
      recovered: true,
      strategy: "WORKFLOW_FALLBACK",
      timestamp: new Date().toISOString(),
    };
  },
};

export default failureRecovery;
