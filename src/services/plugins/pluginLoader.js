/**
 * @file pluginLoader.js
 * @description Loads plugin tools into toolRegistry and plugin nodes into nodeRegistry.
 */

import toolRegistry from "../ai/tools/registry/toolRegistry.js";
import nodeRegistry from "../ai/workflow/registry/nodeRegistry.js";
import logger from "../../utils/logger.js";

export const pluginLoader = {
  /**
   * Loads plugin tools and workflow nodes into core registries.
   * @param {Object} pluginState
   * @param {Object} pluginModule - Exports provided by plugin module
   */
  loadCapabilities: (pluginState, pluginModule = {}) => {
    const { manifest } = pluginState;
    logger.info(`[PluginLoader] Loading capabilities for plugin "${manifest.name}"...`);

    // Register plugin tools
    if (pluginModule.tools && Array.isArray(pluginModule.tools)) {
      pluginModule.tools.forEach((tool) => {
        try {
          toolRegistry.registerTool(tool);
        } catch (err) {
          logger.error(`[PluginLoader] Error registering tool for "${manifest.id}":`, err);
        }
      });
    }

    // Register plugin workflow nodes
    if (pluginModule.workflowNodes && Array.isArray(pluginModule.workflowNodes)) {
      pluginModule.workflowNodes.forEach(({ type, NodeClass }) => {
        try {
          nodeRegistry.registerNodeType(type, NodeClass);
        } catch (err) {
          logger.error(`[PluginLoader] Error registering workflow node for "${manifest.id}":`, err);
        }
      });
    }

    return true;
  },
};

export default pluginLoader;
