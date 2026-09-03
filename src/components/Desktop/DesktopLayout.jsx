import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ActivityBar from "./ActivityBar.jsx";
import DesktopSidebar from "./DesktopSidebar.jsx";
import DesktopMainWorkspace from "./DesktopMainWorkspace.jsx";
import RightInspector from "./RightInspector.jsx";
import BottomStatusBar from "./BottomStatusBar.jsx";
import CommandPaletteModal from "./CommandPaletteModal.jsx";
import shortTermMemory from "../../services/ai/memory/shortTermMemory.js";
import { NotificationContext } from "../../context/NotificationContext";
import { Search, X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import "./desktopStyles.css";

const PATH_TAB_MAP = {
  "/": "assistant",
  "/assistant": "assistant",
  "/dashboard": "assistant",
  "/chat": "assistant",
  "/workspace": "assistant",
  "/coding-workspace": "studio",
  "/coding": "studio",
  "/knowledge": "knowledge",
  "/graph": "knowledge",
  "/projects": "projects",
  "/planner": "planner",
  "/tasks": "planner",
  "/notes": "notes",
  "/settings": "settings",
  "/learning": "learning",
  "/analytics": "analytics",
  "/profile": "profile",
};

const TAB_PATH_MAP = {
  assistant: "/",
  chat: "/",
  dashboard: "/",
  workspace: "/",
  studio: "/coding-workspace",
  coding: "/coding-workspace",
  knowledge: "/knowledge",
  graph: "/knowledge",
  projects: "/projects",
  planner: "/planner",
  tasks: "/planner",
  notes: "/notes",
  settings: "/settings",
  learning: "/learning",
  analytics: "/analytics",
  profile: "/profile",
};

export function DesktopLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTabFromPath = PATH_TAB_MAP[location.pathname] || "assistant";
  const [activeTab, setActiveTab] = useState(currentTabFromPath);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteMode, setPaletteMode] = useState("palette");

  // Universal Search Drawer State
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Notification Queue System (Consuming NotificationContext)
  const notificationCtx = useContext(NotificationContext);
  const notifications = notificationCtx?.notifications || [];

  useEffect(() => {
    const tab = PATH_TAB_MAP[location.pathname] || "assistant";
    setActiveTab(tab);
  }, [location.pathname]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    const targetPath = TAB_PATH_MAP[tabId] || "/";
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    shortTermMemory.setActivePage(activeTab);
  }, [activeTab]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && !e.shiftKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        setPaletteMode("quickOpen");
        setIsCommandPaletteOpen(true);
      } else if (isCtrl && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPaletteMode("palette");
        setIsCommandPaletteOpen(true);
      } else if (isCtrl && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if (isCtrl && e.shiftKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#050508] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      <div className="flex-1 flex w-full h-[calc(100vh-28px)] overflow-hidden relative">
        <ActivityBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenCommandPalette={() => {
            setPaletteMode("palette");
            setIsCommandPaletteOpen(true);
          }}
          onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
        />

        {isSidebarOpen && <DesktopSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />}

        <DesktopMainWorkspace activeTab={activeTab}>{children}</DesktopMainWorkspace>

        <RightInspector isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} />
      </div>

      <BottomStatusBar onToggleInspector={() => setIsInspectorOpen((prev) => !prev)} isInspectorOpen={isInspectorOpen} />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        initialMode={paletteMode}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={handleSelectTab}
      />

      {isGlobalSearchOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150"
          onClick={() => setIsGlobalSearchOpen(false)}
        >
          <div
            className="w-[660px] bg-[#0e0e14] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#08080c]">
              <Search className="w-4 h-4 text-indigo-400 mr-3 shrink-0" />
              <input
                type="text"
                aria-label="Universal Search Query"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Universal Search across code, conversations, notes, projects & documents... (Ctrl+Shift+F)"
                autoFocus
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button onClick={() => setIsGlobalSearchOpen(false)} aria-label="Close Drawer" className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[380px] overflow-y-auto space-y-2 text-xs v2-scrollbar">
              {globalSearchQuery ? (
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Results for "{globalSearchQuery}"</div>
                  <div
                    onClick={() => { handleSelectTab("studio"); setIsGlobalSearchOpen(false); }}
                    className="p-3 rounded-lg bg-[#050508] border border-white/5 cursor-pointer hover:border-indigo-500/30"
                  >
                    <div className="font-semibold text-indigo-300">main.py (Code File)</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Matching content found in workspace editor</div>
                  </div>
                  <div
                    onClick={() => { handleSelectTab("assistant"); setIsGlobalSearchOpen(false); }}
                    className="p-3 rounded-lg bg-[#050508] border border-white/5 cursor-pointer hover:border-indigo-500/30"
                  >
                    <div className="font-semibold text-cyan-300">AI Assistant Thread (Conversation)</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Matches query terms in conversation history</div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  Type query to search across all workspace resources.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-10 right-6 z-50 space-y-2 max-w-sm">
        {notifications.map((n) => {
          const toastType = n.priority || n.type || "info";
          return (
            <div
              key={n.id}
              onClick={() => notificationCtx?.deleteNotification?.(n.id)}
              className={`p-3.5 rounded-xl border backdrop-blur-xl shadow-xl flex items-start gap-3 text-xs animate-in slide-in-from-right-5 duration-200 cursor-pointer ${
                toastType === "success"
                  ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100"
                  : toastType === "warning"
                  ? "bg-amber-950/90 border-amber-500/30 text-amber-100"
                  : toastType === "error"
                  ? "bg-rose-950/90 border-rose-500/30 text-rose-100"
                  : "bg-[#0e0e14]/95 border-indigo-500/30 text-slate-100"
              }`}
              title="Click to dismiss"
            >
              {toastType === "success" && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {toastType === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {toastType === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {toastType === "info" && <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <div className="font-bold text-white tracking-tight">{n.title}</div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{n.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DesktopLayout;
