import pluginManager from "./plugins/pluginManager";
import marketplaceEngine from "./plugins/marketplaceEngine";
import eventBus from "./plugins/eventBus";
import commandRegistry from "./plugins/commandRegistry";

// Backward compatibility wrapper mapping pluginService to Phase 9 Plugin Platform
export const pluginService = {
  getInstalledPlugins: (workspaceId = "default") => {
    return pluginManager.getInstalledPlugins(workspaceId).map((p) => ({
      ...p,
      status: p.enabled ? "Enabled" : "Disabled",
    }));
  },

  togglePlugin: (pluginId, workspaceId = "default") => {
    const updated = pluginManager.togglePlugin(pluginId, workspaceId);
    return updated.map((p) => ({ ...p, status: p.enabled ? "Enabled" : "Disabled" }));
  },

  savePluginSettings: (pluginId, settingsKey, val, workspaceId = "default") => {
    const updated = pluginManager.updateSetting(pluginId, settingsKey, val, workspaceId);
    return updated.map((p) => ({ ...p, status: p.enabled ? "Enabled" : "Disabled" }));
  },

  onEnable: (plugin) => {
    eventBus.publish("PluginEnabled", { pluginId: plugin.id });
  },

  onDisable: (plugin) => {
    eventBus.publish("PluginDisabled", { pluginId: plugin.id });
  },

  manager: pluginManager,
  marketplace: marketplaceEngine,
  commands: commandRegistry,
  events: eventBus,
};

export default pluginService;
