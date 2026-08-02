/**
 * @file actionRuntime.js
 * @description Action Runtime engine for executing action tools.
 */

import toolExecutor from "./toolExecutor.js";
import logger from "../../../../utils/logger.js";

export const actionRuntime = {
  /**
   * Dispatches and executes an action tool.
   * @param {string} actionId
   * @param {Object} args
   * @param {Object} [context]
   */
  dispatchAction: async (actionId, args = {}, context = {}) => {
    logger.info(`[ActionRuntime] Dispatching action "${actionId}"...`);
    return await toolExecutor.executeTool(actionId, args, context);
  },
};

export default actionRuntime;
