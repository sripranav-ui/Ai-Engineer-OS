import React from "react";
import { Cpu, Key, Puzzle, Database, GitMerge, Bell, Palette, Keyboard, ShieldCheck, Lock, Code, Activity, Terminal } from "lucide-react";

export const SETTINGS_CATEGORIES = [
  { id: "ai_models", label: "AI Models & Providers", icon: Cpu },
  { id: "api_keys", label: "API Keys", icon: Key },
  { id: "plugins", label: "Plugins Framework", icon: Puzzle },
  { id: "memory", label: "Memory & Context", icon: Database },
  { id: "workflows", label: "Workflows & Automation", icon: GitMerge },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "security", label: "Security & RBAC", icon: ShieldCheck },
  { id: "privacy", label: "Privacy & Data", icon: Lock },
  { id: "developer", label: "Developer Mode", icon: Code },
  { id: "diagnostics", label: "Diagnostics & Health", icon: Activity },
  { id: "logs", label: "System Logs", icon: Terminal },
];

export function SettingsCategorySidebar({ activeCategory, onSelectCategory }) {
  return (
    <div className="w-64 bg-[#0A0D16] border-r border-white/[0.07] p-3.5 flex flex-col h-full shrink-0 select-none">
      <div className="text-xs font-bold text-slate-200 mb-3 px-2 tracking-tight uppercase font-mono text-[10px] tracking-wider text-slate-400">Settings Categories</div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 desktop-scrollbar">
        {SETTINGS_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/20 border border-indigo-500/35 text-indigo-200 font-semibold shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SettingsCategorySidebar;
