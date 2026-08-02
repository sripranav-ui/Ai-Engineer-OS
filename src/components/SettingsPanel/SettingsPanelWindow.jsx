import React, { useState } from "react";
import SettingsCategorySidebar, { SETTINGS_CATEGORIES } from "./SettingsCategorySidebar.jsx";
import AIModelsSettingsSection from "./AIModelsSettingsSection.jsx";
import APIKeysSettingsSection from "./APIKeysSettingsSection.jsx";
import MemorySettingsSection from "./MemorySettingsSection.jsx";
import SecuritySettingsSection from "./SecuritySettingsSection.jsx";
import DiagnosticsLogsSection from "./DiagnosticsLogsSection.jsx";
import { Settings } from "lucide-react";
import "./settingsPanelStyles.css";

export function SettingsPanelWindow() {
  const [activeCategory, setActiveCategory] = useState("ai_models");

  const currentCategorySpec = SETTINGS_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 flex font-sans overflow-hidden">
      {/* Category Navigation Sidebar */}
      <SettingsCategorySidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {/* Main Settings Content */}
      <div className="flex-1 h-full p-6 overflow-y-auto bg-[#05050A] desktop-scrollbar">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.07]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-violet-500/20 border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/10">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{currentCategorySpec?.label || "Settings"}</h1>
            <p className="text-xs text-slate-400 mt-0.5">System preferences and platform configuration</p>
          </div>
        </div>

        {activeCategory === "ai_models" && <AIModelsSettingsSection />}
        {activeCategory === "api_keys" && <APIKeysSettingsSection />}
        {activeCategory === "memory" && <MemorySettingsSection />}
        {activeCategory === "security" && <SecuritySettingsSection />}
        {activeCategory === "diagnostics" && <DiagnosticsLogsSection />}
        {activeCategory === "logs" && <DiagnosticsLogsSection />}

        {["plugins", "workflows", "notifications", "appearance", "shortcuts", "privacy", "developer"].includes(activeCategory) && (
          <div className="p-5 rounded-2xl bg-[#0F1320]/90 backdrop-blur-xl border border-white/[0.07] shadow-xl">
            <div className="text-sm font-bold text-slate-100 tracking-tight mb-1">{currentCategorySpec?.label} Preferences</div>
            <p className="text-xs text-slate-400 leading-relaxed">Settings configured automatically through backend singletons and persistent local storage.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPanelWindow;
