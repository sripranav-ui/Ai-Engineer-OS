import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Code, Database, Folder, CheckSquare, FileText, Settings } from "lucide-react";

// Core Navigation Destinations
const CORE_NAV_ITEMS = [
  { id: "assistant", path: "/", label: "Assistant", icon: MessageSquare },
  { id: "studio", path: "/coding-workspace", label: "Studio", icon: Code },
  { id: "knowledge", path: "/knowledge", label: "Knowledge", icon: Database },
  { id: "projects", path: "/projects", label: "Projects", icon: Folder },
  { id: "planner", path: "/planner", label: "Planner", icon: CheckSquare },
  { id: "notes", path: "/notes", label: "Notes", icon: FileText },
  { id: "settings", path: "/settings", label: "Settings", icon: Settings },
];

export function DesktopSidebar({ activeTab, onSelectTab }) {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (onSelectTab) {
      onSelectTab(item.id);
    }
    navigate(item.path);
  };

  return (
    <aside className="group w-14 hover:w-44 bg-[#050508] border-r border-white/[0.04] p-3 flex flex-col justify-between h-full select-none shrink-0 transition-all duration-200 ease-out z-40">
      {/* Top Dot Indicator */}
      <div className="flex items-center gap-3 px-2 py-2 mb-6">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-sm shadow-indigo-500/50" />
        <span className="text-[11px] font-mono font-bold tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
          AI ENGINEER OS
        </span>
      </div>

      {/* Navigation Triggers */}
      <div className="space-y-3 flex-1">
        {CORE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-indigo-600/20 text-white font-medium border border-indigo-500/30 shadow-md shadow-indigo-600/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              <span className="truncate text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Version */}
      <div className="px-2 py-2 text-[10px] font-mono text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity truncate">
        v6.0 Arc Native
      </div>
    </aside>
  );
}

export default React.memo(DesktopSidebar);
