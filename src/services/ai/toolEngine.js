// =======================================================
// toolEngine.js — AI Tool Execution System Wrapper
// =======================================================
// Dispatches tool executions through the enterprise toolExecutor.
// =======================================================

import { toolRegistry, toolExecutor } from "./tools/index.js";
import logger from "../../utils/logger";

export const toolEngine = {
  /** Get all available tools schema for LLM system prompts */
  getAvailableTools: () => {
    return toolRegistry.getAllTools().map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      permissions: t.permissions,
    }));
  },

  /** Execute a registered tool safely via enterprise Tool Runtime */
  executeTool: async (toolId, args = {}, contextData = {}) => {
    logger.info(`[ToolEngine] Executing tool "${toolId}" via Enterprise Tool Runtime...`);
    return await toolExecutor.executeTool(toolId, args, contextData);
  },
};

export default toolEngine;
