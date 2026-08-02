import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Code,
  GraduationCap,
  Folder,
  Share2,
  GitMerge,
  Database,
  CheckSquare,
  FileText,
  Briefcase,
  Users,
  Puzzle,
  Server,
  Zap,
  BarChart2,
  Terminal,
  Settings,
} from "lucide-react";

export const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Operations Center", icon: LayoutDashboard },
  { id: "chat", label: "AI Assistant", icon: MessageSquare },
  { id: "coding", label: "Coding Studio", icon: Code },
  { id: "learning", label: "Learning Hub", icon: GraduationCap },
  { id: "projects", label: "Projects Vault", icon: Folder },
  { id: "graph", label: "Knowledge Graph", icon: Share2 },
  { id: "workflow", label: "Workflow Builder", icon: GitMerge },
  { id: "memory", label: "Memory Explorer", icon: Database },
  { id: "tasks", label: "Task Manager", icon: CheckSquare },
  { id: "notes", label: "Notes & Vault", icon: FileText },
  { id: "career", label: "Career Coach", icon: Briefcase },
  { id: "community", label: "Community Hub", icon: Users },
  { id: "plugins", label: "Plugin Marketplace", icon: Puzzle },
  { id: "mcp", label: "MCP Manager", icon: Server },
  { id: "automation", label: "Automation Engine", icon: Zap },
  { id: "analytics", label: "Analytics & Logs", icon: BarChart2 },
  { id: "terminal", label: "OS Terminal", icon: Terminal },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "devtools", label: "Developer Tools", icon: Code },
];

export function ActivityBar({ activeTab, onSelectTab, onOpenCommandPalette, onToggleInspector }) {
  return (
    <div className="w-12 bg-[#09090b] border-r border-white/[0.06] flex flex-col items-center py-3 select-none z-20 shrink-0">
      {/* OS Logo / Command Launcher Icon */}
      <button
        onClick={onOpenCommandPalette}
        title="Open Command Palette (Ctrl+K)"
        className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center mb-3 hover:bg-indigo-600/25 transition-all"
      >
        <Zap className="w-4 h-4 fill-current" />
      </button>

      {/* Main Navigation Bar Icons */}
      <div className="flex-1 w-full flex flex-col items-center space-y-1 overflow-y-auto v2-scrollbar">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {isActive && (
                <div className="w-1 h-3 rounded-r-full bg-indigo-400 absolute -left-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityBar;
