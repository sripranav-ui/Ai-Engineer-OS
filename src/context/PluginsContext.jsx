import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from "react";
import { WorkspaceManagerContext } from "./WorkspaceManagerContext";
import pluginManager from "../services/plugins/pluginManager";
import marketplaceEngine from "../services/plugins/marketplaceEngine";
import commandRegistry from "../services/plugins/commandRegistry";
import eventBus from "../services/plugins/eventBus";
import createExtensionSDK from "../services/plugins/extensionSDK";

export const PluginsContext = createContext(null);

export function PluginsProvider({ children }) {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const [installedPlugins, setInstalledPlugins] = useState([]);
  const [activeCategory, setActiveCategory]     = useState("All");

  // Refresh installed plugins list
  const refreshPlugins = useCallback(() => {
    const list = pluginManager.getInstalledPlugins(activeWorkspaceId);
    setInstalledPlugins(list);
  }, [activeWorkspaceId]);

  useEffect(() => {
    refreshPlugins();
  }, [refreshPlugins]);

  // Toggle enable / disable plugin
  const togglePlugin = useCallback(
    (pluginId) => {
      pluginManager.togglePlugin(pluginId, activeWorkspaceId);
      refreshPlugins();
    },
    [activeWorkspaceId, refreshPlugins]
  );

  // Update setting
  const updateSetting = useCallback(
    (pluginId, settingKey, value) => {
      pluginManager.updateSetting(pluginId, settingKey, value, activeWorkspaceId);
      refreshPlugins();
    },
    [activeWorkspaceId, refreshPlugins]
  );

  // Install plugin from marketplace
  const installPlugin = useCallback(
    (marketplacePlugin) => {
      pluginManager.installPlugin(marketplacePlugin, activeWorkspaceId);
      refreshPlugins();
    },
    [activeWorkspaceId, refreshPlugins]
  );

  const value = useMemo(
    () => ({
      installedPlugins,
      availablePlugins: marketplaceEngine.getAvailablePlugins(),
      categories: marketplaceEngine.getCategories(),
      activeCategory,
      setActiveCategory,
      togglePlugin,
      updateSetting,
      installPlugin,
      registeredCommands: commandRegistry.getCommands(),
      createSDK: (plugin) => createExtensionSDK(plugin),
      events: eventBus,
    }),
    [installedPlugins, activeCategory, togglePlugin, updateSetting, installPlugin]
  );

  return <PluginsContext.Provider value={value}>{children}</PluginsContext.Provider>;
}

export function usePlugins() {
  const ctx = useContext(PluginsContext);
  if (!ctx) throw new Error("usePlugins must be used within a <PluginsProvider>");
  return ctx;
}

export default PluginsContext;
