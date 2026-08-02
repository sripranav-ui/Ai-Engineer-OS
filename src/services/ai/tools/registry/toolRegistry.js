// =======================================================
// toolRegistry.js — Enterprise Tool Registry Singleton
// =======================================================

import logger from "../../../../utils/logger.js";

class ToolRegistry {
  constructor() {
    this.toolsMap = new Map();
  }

  /** Register new tool */
  registerTool(tool) {
    if (!tool || !tool.id) throw new Error("Invalid tool instance registered.");
    this.toolsMap.set(tool.id, tool);
    logger.info(`[ToolRegistry] Registered tool "${tool.name}" (${tool.id}).`);
  }

  /** Get registered tool by ID */
  getTool(toolId) {
    return this.toolsMap.get(toolId) || null;
  }

  /** List all registered tools */
  getAllTools() {
    return Array.from(this.toolsMap.values());
  }

  /** Find tools by category */
  getToolsByCategory(category) {
    return Array.from(this.toolsMap.values()).filter((t) => t.category === category);
  }
}

export const toolRegistry = new ToolRegistry();
export default toolRegistry;
