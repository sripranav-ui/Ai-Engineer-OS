/**
 * @file pluginManager.js
 * @description Master Plugin Manager orchestrating plugin lifecycles, registration, and UI integration.
 */

import pluginManifestValidator from "./pluginManifestValidator.js";
import pluginRegistry from "./pluginRegistry.js";
import pluginLoader from "./pluginLoader.js";
import { PLUGIN_LIFECYCLE, createPluginState } from "./pluginLifecycle.js";
import { pluginStorage } from "./pluginStorage.js";
import logger from "../../utils/logger.js";

export const pluginManager = {
  /**
   * Loads and initializes a plugin instance.
   * @param {Object} manifest - Plugin manifest definition
   * @param {Object} [pluginModule={}] - Exported tools, agents, workflow nodes
   */
  loadPlugin: (manifest, pluginModule = {}) => {
    const validation = pluginManifestValidator.validate(manifest);
    if (!validation.valid) {
      throw new Error(`Plugin Manifest Validation Failed for "${manifest?.id}": ${validation.errors.join("; ")}`);
    }

    if (pluginRegistry.getPlugin(manifest.id)) {
      throw new Error(`Plugin "${manifest.id}" is already registered.`);
    }

    const state = createPluginState(manifest);
    state.status = PLUGIN_LIFECYCLE.LOADED;
    state.loadedAt = new Date().toISOString();

    pluginRegistry.registerPlugin(state);
    pluginLoader.loadCapabilities(state, pluginModule);

    state.status = PLUGIN_LIFECYCLE.ENABLED;
    logger.info(`[PluginManager] Plugin "${manifest.name}" (${manifest.id}) successfully loaded and enabled.`);
    return state;
  },

  /** Get list of all installed plugins for workspace */
  getInstalledPlugins: (workspaceId = "default") => {
    const registryPlugins = pluginRegistry.getAllPlugins();
    if (registryPlugins.length > 0) {
      return registryPlugins.map((p) => ({
        ...p.manifest,
        enabled: p.status === PLUGIN_LIFECYCLE.ENABLED,
        status: p.status,
      }));
    }

    // Storage fallback for marketplace plugins
    const stored = pluginStorage.getItem("installed_plugins_list", workspaceId);
    return stored || [];
  },

  /** Toggles an installed plugin's enabled status */
  togglePlugin: (pluginId, workspaceId = "default") => {
    const state = pluginRegistry.getPlugin(pluginId);
    if (state) {
      state.status = state.status === PLUGIN_LIFECYCLE.ENABLED ? PLUGIN_LIFECYCLE.DISABLED : PLUGIN_LIFECYCLE.ENABLED;
      logger.info(`[PluginManager] Toggled plugin "${pluginId}" -> ${state.status}.`);
      return state.status === PLUGIN_LIFECYCLE.ENABLED;
    }

    // Storage fallback
    const list = pluginManager.getInstalledPlugins(workspaceId);
    const updated = list.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p));
    pluginStorage.setItem("installed_plugins_list", updated, workspaceId);
    return true;
  },

  /** Updates setting key-value for a plugin */
  updateSetting: (pluginId, settingKey, value, workspaceId = "default") => {
    const list = pluginManager.getInstalledPlugins(workspaceId);
    const updated = list.map((p) => {
      if (p.id === pluginId && p.settings) {
        const settings = p.settings.map((s) => (s.key === settingKey ? { ...s, value } : s));
        return { ...p, settings };
      }
      return p;
    });
    pluginStorage.setItem("installed_plugins_list", updated, workspaceId);
  },

  /** Installs a marketplace plugin */
  installPlugin: (marketplacePlugin, workspaceId = "default") => {
    const list = pluginManager.getInstalledPlugins(workspaceId);
    if (!list.some((p) => p.id === marketplacePlugin.id)) {
      const entry = { ...marketplacePlugin, enabled: true, installedAt: new Date().toISOString() };
      list.push(entry);
      pluginStorage.setItem("installed_plugins_list", list, workspaceId);

      // Attempt loading into registry if permissions pass
      try {
        pluginManager.loadPlugin(entry);
      } catch (err) {
        logger.warn(`[PluginManager] Registered marketplace plugin "${entry.id}" to storage.`);
      }
    }
  },

  /** Disables an active plugin */
  disablePlugin: (pluginId) => {
    const state = pluginRegistry.getPlugin(pluginId);
    if (state) {
      state.status = PLUGIN_LIFECYCLE.DISABLED;
      logger.info(`[PluginManager] Disabled plugin "${pluginId}".`);
    }
  },

  /** Enables a disabled plugin */
  enablePlugin: (pluginId) => {
    const state = pluginRegistry.getPlugin(pluginId);
    if (state) {
      state.status = PLUGIN_LIFECYCLE.ENABLED;
      logger.info(`[PluginManager] Enabled plugin "${pluginId}".`);
    }
  },

  /** Uninstalls a plugin */
  uninstallPlugin: (pluginId) => {
    const state = pluginRegistry.getPlugin(pluginId);
    if (state) {
      state.status = PLUGIN_LIFECYCLE.REMOVED;
      pluginRegistry.unregisterPlugin(pluginId);
      logger.info(`[PluginManager] Uninstalled plugin "${pluginId}".`);
    }
  },
};

export default pluginManager;
