// =======================================================
// toolExecutor.js — Tool Execution Runtime Wrappers
// =======================================================

import toolRegistry from "../registry/toolRegistry.js";
import permissionManager from "./permissionManager.js";
import argumentValidator from "./argumentValidator.js";
import resultValidator from "./resultValidator.js";
import toolLogger from "../observability/toolLogger.js";
import toolMetrics from "../observability/toolMetrics.js";
import createExecutionContext from "../base/executionContext.js";
import logger from "../../../../utils/logger.js";

export const toolExecutor = {
  /**
   * Execute registered tool safely through permissions, validation, and metrics logging
   * @param {string} toolId
   * @param {object} args
   * @param {object} [contextData]
   */
  executeTool: async (toolId, args = {}, contextData = {}) => {
    const startTime = Date.now();
    logger.info(`[ToolExecutor] Invoking tool "${toolId}"...`);

    const tool = toolRegistry.getTool(toolId);
    if (!tool) {
      const err = new Error(`Tool "${toolId}" is not registered in toolRegistry.`);
      toolLogger.logError(toolId, err);
      throw err;
    }

    const context = createExecutionContext(contextData);

    // 1. Validate permissions
    const permCheck = permissionManager.validatePermissions(tool, context);
    if (!permCheck.allowed) {
      const err = new Error(`Permission Denied for tool "${toolId}": ${permCheck.reason}`);
      toolLogger.logError(toolId, err);
      throw err;
    }

    // 2. Validate input arguments
    const argCheck = argumentValidator.validateArgs(tool, args);
    if (!argCheck.valid) {
      const err = new Error(`Invalid Arguments for tool "${toolId}": ${argCheck.errors.join(", ")}`);
      toolLogger.logError(toolId, err);
      throw err;
    }

    try {
      // 3. Execute tool call with timeout race
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tool "${toolId}" execution timed out after ${tool.timeoutMs}ms.`)), tool.timeoutMs)
      );

      const result = await Promise.race([tool.execute(args, context), timeoutPromise]);

      // 4. Validate execution result
      const resCheck = resultValidator.validateResult(tool, result);
      if (!resCheck.valid) {
        logger.warn(`[ToolExecutor] Result validation warnings for tool "${toolId}":`, resCheck.warnings);
      }

      const durationMs = Date.now() - startTime;
      toolLogger.logSuccess(toolId, args, result, durationMs);
      toolMetrics.recordExecution(toolId, true, durationMs);

      return result;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      toolLogger.logError(toolId, err, durationMs);
      toolMetrics.recordExecution(toolId, false, durationMs);
      throw err;
    }
  },
};

export default toolExecutor;
