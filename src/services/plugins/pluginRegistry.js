/**
 * @file pluginRegistry.js
 * @description Central Plugin Registry singleton for tracking loaded plugins.
 */

import logger from "../../utils/logger.js";

class PluginRegistry {
  constructor() {
    this.pluginsMap = new Map();
  }

  registerPlugin(pluginState) {
    if (!pluginState || !pluginState.id) throw new Error("Invalid plugin state.");
    this.pluginsMap.set(pluginState.id, pluginState);
    logger.info(`[PluginRegistry] Registered plugin "${pluginState.manifest.name}" (${pluginState.id}).`);
  }

  unregisterPlugin(pluginId) {
    this.pluginsMap.delete(pluginId);
    logger.info(`[PluginRegistry] Unregistered plugin "${pluginId}".`);
  }

  getPlugin(pluginId) {
    return this.pluginsMap.get(pluginId) || null;
  }

  getAllPlugins() {
    return Array.from(this.pluginsMap.values());
  }
}

export const pluginRegistry = new PluginRegistry();
export default pluginRegistry;
