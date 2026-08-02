import React, { useState, useEffect } from "react";
import PluginCard from "./PluginCard.jsx";
import PluginDetailsModal from "./PluginDetailsModal.jsx";
import PluginSettingsModal from "./PluginSettingsModal.jsx";
import PluginLogsDrawer from "./PluginLogsDrawer.jsx";
import DeveloperModeModal from "./DeveloperModeModal.jsx";
import pluginManager from "../../services/plugins/pluginManager.js";
import marketplaceEngine from "../../services/plugins/marketplaceEngine.js";
import { FiPackage, FiSearch, FiCode, FiTerminal } from "react-icons/fi";
import "./pluginMarketplaceStyles.css";

export function PluginMarketplaceWindow() {
  const [installedPlugins, setInstalledPlugins] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPluginDetails, setSelectedPluginDetails] = useState(null);
  const [selectedPluginSettings, setSelectedPluginSettings] = useState(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDevModeOpen, setIsDevModeOpen] = useState(false);

  const categories = marketplaceEngine.getCategories();
  const availablePlugins = marketplaceEngine.getAvailablePlugins();

  const refreshInstalled = () => {
    const list = pluginManager.getInstalledPlugins("default");
    setInstalledPlugins(list);
  };

  useEffect(() => {
    refreshInstalled();
  }, []);

  const handleInstall = (plugin) => {
    pluginManager.installPlugin(plugin, "default");
    refreshInstalled();
  };

  const handleToggle = (pluginId) => {
    pluginManager.togglePlugin(pluginId, "default");
    refreshInstalled();
  };

  const handleSaveSetting = (pluginId, key, val) => {
    pluginManager.updateSetting(pluginId, key, val, "default");
    refreshInstalled();
  };

  const handleLoadDevManifest = (manifest) => {
    try {
      pluginManager.loadPlugin(manifest);
      refreshInstalled();
      alert(`Developer plugin "${manifest.name}" registered and enabled successfully!`);
    } catch (err) {
      alert(`Error loading manifest: ${err.message}`);
    }
  };

  const isInstalled = (pluginId) => installedPlugins.some((p) => p.id === pluginId);
  const isEnabled = (pluginId) => installedPlugins.some((p) => p.id === pluginId && p.enabled);

  const filteredPlugins = availablePlugins.filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      (String(p?.name || "").toLowerCase().includes(String(searchQuery || "").toLowerCase()) ||
        String(p?.description || "").toLowerCase().includes(String(searchQuery || "").toLowerCase()))
  );

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans relative desktop-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-violet-500/20 border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/10">
            <FiPackage className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Enterprise Plugin Marketplace</h1>
            <p className="text-xs text-slate-400 mt-0.5">Extend AI Engineer OS capabilities via modular plugins and MCP extensions</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDevModeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#090C14] text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm"
          >
            <FiCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Developer Mode</span>
          </button>
          <button
            onClick={() => setIsLogsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#090C14] text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm"
          >
            <FiTerminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative w-72">
          <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plugins..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#090C14] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 desktop-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "bg-[#090C14] border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="plugin-grid">
        {filteredPlugins.map((plugin) => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            isInstalled={isInstalled(plugin.id)}
            isEnabled={isEnabled(plugin.id)}
            onInstall={handleInstall}
            onToggle={handleToggle}
            onOpenDetails={setSelectedPluginDetails}
            onOpenSettings={setSelectedPluginSettings}
          />
        ))}
      </div>

      {/* Modals & Drawers */}
      <PluginDetailsModal plugin={selectedPluginDetails} isOpen={!!selectedPluginDetails} onClose={() => setSelectedPluginDetails(null)} />

      <PluginSettingsModal
        plugin={selectedPluginSettings}
        isOpen={!!selectedPluginSettings}
        onClose={() => setSelectedPluginSettings(null)}
        onSaveSetting={handleSaveSetting}
      />

      <PluginLogsDrawer isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />

      <DeveloperModeModal isOpen={isDevModeOpen} onClose={() => setIsDevModeOpen(false)} onLoadManifest={handleLoadDevManifest} />
    </div>
  );
}

export default PluginMarketplaceWindow;
