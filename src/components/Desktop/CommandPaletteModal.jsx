import React, { useState, useEffect, useMemo } from "react";
import { Search, Zap, Command, X, FileText, Settings, Code, Sparkles, Folder, Terminal, Database, CheckSquare } from "lucide-react";
import commandRegistry from "../../services/plugins/commandRegistry.js";

const RECENT_COMMANDS_KEY = "rag_ide_recent_commands_v3";

const SYSTEM_NAV_ITEMS = [
  { id: "assistant", label: "AI Assistant", icon: Sparkles },
  { id: "studio", label: "Studio Canvas", icon: Code },
  { id: "knowledge", label: "Knowledge Vault", icon: Database },
  { id: "projects", label: "Projects Tracker", icon: Folder },
  { id: "planner", label: "Task Planner", icon: CheckSquare },
  { id: "notes", label: "Notes & Docs", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export function CommandPaletteModal({ isOpen, onClose, onSelectTab, initialMode = "palette" }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  const [recentCommandIds, setRecentCommandIds] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_COMMANDS_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : ["nav_assistant", "nav_studio"];
    } catch {
      return ["nav_assistant", "nav_studio"];
    }
  });

  const recordRecentCommand = (id) => {
    setRecentCommandIds((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const updated = [id, ...list.filter((item) => item !== id)].slice(0, 5);
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const allCommands = useMemo(() => {
    return [
      ...SYSTEM_NAV_ITEMS.map((nav) => ({
        id: `nav_${nav.id}`,
        title: `Switch to ${nav.label}`,
        category: "Navigation",
        icon: nav.icon,
        action: () => {
          recordRecentCommand(`nav_${nav.id}`);
          onSelectTab(nav.id);
          onClose();
        },
      })),
      {
        id: "cmd_studio",
        title: "Open Studio Code Canvas",
        category: "IDE",
        icon: Code,
        action: () => {
          recordRecentCommand("cmd_studio");
          onSelectTab("studio");
          onClose();
        },
      },
      {
        id: "cmd_assistant",
        title: "Open AI Assistant",
        category: "AI Copilot",
        icon: Sparkles,
        action: () => {
          recordRecentCommand("cmd_assistant");
          onSelectTab("assistant");
          onClose();
        },
      },
      {
        id: "cmd_settings",
        title: "Open System Preferences & API Key Settings",
        category: "Settings",
        icon: Settings,
        action: () => {
          recordRecentCommand("cmd_settings");
          onSelectTab("settings");
          onClose();
        },
      },
      {
        id: "file_main_py",
        title: "main.py (Workspace File)",
        category: "Files",
        icon: FileText,
        action: () => {
          onSelectTab("studio");
          onClose();
        },
      },
    ];
  }, [onSelectTab, onClose]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter(
      (cmd) =>
        String(cmd?.title || "").toLowerCase().includes(q) ||
        String(cmd?.category || "").toLowerCase().includes(q)
    );
  }, [query, allCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, mode]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected && selected.action) {
          selected.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-[620px] bg-[#0e0e14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08] bg-[#08080c]">
          <Search className="w-4 h-4 text-indigo-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search workspace resources... (Esc to close)"
            autoFocus
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 font-sans"
          />
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1 v2-scrollbar">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon || Zap;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action && cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="truncate">{cmd.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(CommandPaletteModal);
