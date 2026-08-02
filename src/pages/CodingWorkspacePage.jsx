import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FaFolderOpen,
  FaFileCode,
  FaTerminal,
  FaColumns,
  FaBrain,
  FaLaptopCode,
  FaSearch
} from "react-icons/fa";

import { workTemplates } from "../data/workspaceMockData";

// LocalStorage Keys
const STORAGE_KEYS = {
  OPEN_TABS: "rag_ide_open_tabs_v9",
  ACTIVE_TAB: "rag_ide_active_tab_v9",
  ACTIVE_WORKSPACE: "rag_ide_active_workspace_v9",
  CLOSED_TABS_HISTORY: "rag_ide_closed_tabs_history_v9",
};

export function CodingWorkspacePage() {
  // Pure Floating Overlay States
  const [showFileDrawer, setShowFileDrawer] = useState(false);
  const [showTerminalOverlay, setShowTerminalOverlay] = useState(false);
  const [showCopilotOverlay, setShowCopilotOverlay] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  // Active Project Workspace Configuration
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE) || "python";
  });

  // Workspaces Data
  const [workspacesData, setWorkspacesData] = useState(() => {
    const data = {};
    Object.keys(workTemplates).forEach((key) => {
      data[key] = [...workTemplates[key].files];
    });
    return data;
  });

  // Editor Tabs Configuration with Guarded Array Parsing
  const [openTabs, setOpenTabs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPEN_TABS);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["main.py"];
    } catch {
      return ["main.py"];
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || "main.py";
  });

  const [closedTabsHistory, setClosedTabsHistory] = useState([]);
  const [dirtyFiles, setDirtyFiles] = useState(new Set());
  const [isSplit, setIsSplit] = useState(false);
  const [activeSplitTab, setActiveSplitTab] = useState("");

  // Search Query
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Copilot Stream & Prompt
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChatLogs, setAiChatLogs] = useState([
    { sender: "agent", text: "✨ Cursor Copilot Active. Press ⌘K or type instructions to generate zero-allocation code." },
  ]);

  // Terminal Shell State
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalStdout, setTerminalStdout] = useState([
    { text: `[${new Date().toLocaleTimeString()}] 🚀 Cursor Sacred Canvas Shell`, type: "info" },
    { text: `Active Environment: ${activeWorkspace.toUpperCase()} • Type 'help' for CLI utilities.`, type: "info" },
    { text: "", type: "info" },
  ]);

  // Global Keyboard Shortcuts (⌘K, ⌘P, ⌘~) with Clean Unsubscribe
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCopilotOverlay((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        setShowQuickSearch((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "~") {
        e.preventDefault();
        setShowTerminalOverlay((prev) => !prev);
      } else if (e.key === "Escape") {
        setShowCopilotOverlay(false);
        setShowQuickSearch(false);
        setShowTerminalOverlay(false);
        setShowFileDrawer(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Persistence
  useEffect(() => {
    const safeTabs = Array.isArray(openTabs) ? openTabs : ["main.py"];
    localStorage.setItem(STORAGE_KEYS.OPEN_TABS, JSON.stringify(safeTabs));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab || "main.py");
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE, activeWorkspace || "python");
  }, [openTabs, activeTab, activeWorkspace]);

  const currentFiles = useMemo(() => {
    const files = workspacesData[activeWorkspace];
    return Array.isArray(files) ? files : [];
  }, [workspacesData, activeWorkspace]);

  const activeFile = useMemo(() => {
    return currentFiles.find((f) => f && f.name === activeTab) || currentFiles[0] || null;
  }, [currentFiles, activeTab]);

  const activeSplitFile = useMemo(() => {
    if (!activeSplitTab) return null;
    return currentFiles.find((f) => f && f.name === activeSplitTab) || null;
  }, [currentFiles, activeSplitTab]);

  const handleEditContent = (value, pane = "left") => {
    const targetTab = pane === "left" ? activeTab : activeSplitTab;
    if (!targetTab) return;

    setWorkspacesData((prev) => {
      const files = prev[activeWorkspace] || [];
      const updatedFiles = files.map((file) => {
        if (file.name === targetTab) {
          return { ...file, content: value };
        }
        return file;
      });
      return { ...prev, [activeWorkspace]: updatedFiles };
    });

    setDirtyFiles((prev) => new Set(prev).add(targetTab));
  };

  const handleOpenFile = (filename) => {
    const safeTabs = Array.isArray(openTabs) ? openTabs : [];
    if (!safeTabs.includes(filename)) {
      setOpenTabs((prev) => [...(Array.isArray(prev) ? prev : []), filename]);
    }
    setActiveTab(filename);
    setShowFileDrawer(false);
    setShowQuickSearch(false);
  };

  const handleCloseTab = (filename, e) => {
    if (e) e.stopPropagation();
    setClosedTabsHistory((prev) => [filename, ...prev]);
    const safeTabs = Array.isArray(openTabs) ? openTabs : [];
    const updatedTabs = safeTabs.filter((t) => t !== filename);
    setOpenTabs(updatedTabs);

    if (activeTab === filename && updatedTabs.length > 0) {
      setActiveTab(updatedTabs[updatedTabs.length - 1]);
    }
    if (activeSplitTab === filename) {
      setActiveSplitTab("");
      setIsSplit(false);
    }
  };

  const handleToggleSplit = () => {
    if (isSplit) {
      setIsSplit(false);
      setActiveSplitTab("");
    } else {
      setIsSplit(true);
      const otherFile = currentFiles.find((f) => f && f.name !== activeTab)?.name || activeTab;
      setActiveSplitTab(otherFile);
    }
  };

  const handleTerminalSubmit = (e) => {
    if (e.key === "Enter") {
      const cmd = terminalInput.trim();
      setTerminalInput("");
      if (!cmd) return;

      const timeStr = new Date().toLocaleTimeString();
      setTerminalStdout((prev) => [...prev, { text: `[${timeStr}] $ ${cmd}`, type: "input" }]);

      const parts = cmd.split(" ");
      const commandName = parts[0].toLowerCase();

      setTimeout(() => {
        let outputLines = [];
        switch (commandName) {
          case "help":
            outputLines = [
              { text: "Studio CLI Utilities:", type: "info" },
              { text: "  ls                    List workspace source files", type: "info" },
              { text: "  cat <filename>        Print source contents", type: "info" },
              { text: "  python <filename>     Execute python script simulation", type: "info" },
              { text: "  clear                 Clear stdout buffer", type: "info" },
            ];
            break;
          case "ls":
            outputLines = [{ text: currentFiles.map((f) => f.name).join("    "), type: "info" }];
            break;
          case "cat":
            const found = currentFiles.find((f) => f && f.name === parts[1]);
            outputLines = found
              ? [{ text: found.content, type: "info" }]
              : [{ text: `cat: ${parts[1]}: No such file`, type: "error" }];
            break;
          case "python":
            outputLines = [{ text: `🐍 Process '${parts[1] || "main.py"}' finished with exit code 0.`, type: "info" }];
            break;
          case "clear":
            setTerminalStdout([]);
            return;
          default:
            outputLines = [{ text: `sh: command not found: ${commandName}`, type: "error" }];
        }
        setTerminalStdout((prev) => [...prev, ...outputLines, { text: "", type: "info" }]);
      }, 120);
    }
  };

  const handleAiPromptSubmit = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!aiPrompt.trim()) return;
      const text = aiPrompt.trim();
      setAiPrompt("");
      setAiChatLogs((prev) => [...prev, { sender: "user", text }]);

      setTimeout(() => {
        setAiChatLogs((prev) => [
          ...prev,
          {
            sender: "agent",
            text: `✨ Copilot Synthesis for '${activeTab}':\nGenerated optimized implementation for '${text}'. Applied inline zero-copy pattern.`,
          },
        ]);
      }, 600);
    }
  };

  const safeOpenTabs = Array.isArray(openTabs) ? openTabs : ["main.py"];

  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 flex flex-col font-sans overflow-hidden select-none relative">
      {/* 1. FLOATING CONTROL PILL */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-2 rounded-full bg-[#0e0e14]/90 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <button
          onClick={() => setShowFileDrawer(!showFileDrawer)}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          <FaFolderOpen className="text-indigo-400" />
          <span>Files</span>
        </button>

        <span className="text-white/10">|</span>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-white">{activeTab || "No File"}</span>
          {dirtyFiles.has(activeTab) && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </div>

        <span className="text-white/10">|</span>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowCopilotOverlay(!showCopilotOverlay)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all font-mono text-[11px]"
          >
            <span>⌘K</span>
            <span className="font-sans font-medium">Copilot</span>
          </button>

          <button
            onClick={() => setShowQuickSearch(!showQuickSearch)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-300 hover:bg-white/10 transition-all font-mono text-[11px]"
          >
            <span>⌘P</span>
          </button>

          <button
            onClick={() => setShowTerminalOverlay(!showTerminalOverlay)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-300 hover:bg-white/10 transition-all font-mono text-[11px]"
          >
            <span>⌘~</span>
          </button>

          <button
            onClick={handleToggleSplit}
            className={`p-1.5 rounded-full transition-colors ${isSplit ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"}`}
            title="Toggle Split View"
          >
            <FaColumns className="text-xs" />
          </button>
        </div>
      </div>

      {/* 2. SACRED EDITOR CANVAS */}
      <div className="flex-1 w-full h-full pt-16 flex overflow-hidden">
        {/* Subtle Floating Tab Trail */}
        <div className="absolute top-16 left-6 z-20 flex items-center gap-2 overflow-x-auto v2-scrollbar max-w-xl">
          {safeOpenTabs.map((tabName) => {
            const isActive = activeTab === tabName;
            const isDirty = dirtyFiles.has(tabName);
            return (
              <div
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`px-3 py-1 rounded-lg text-xs cursor-pointer flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-[#121218] text-white font-medium border border-white/10 shadow-md"
                    : "text-slate-500 hover:text-slate-300 bg-transparent"
                }`}
              >
                <span>{tabName}</span>
                {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                <button onClick={(e) => handleCloseTab(tabName, e)} className="text-slate-500 hover:text-slate-200 text-xs ml-1">
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Code Canvas */}
        <div className={`flex-1 h-full w-full pt-10 grid ${isSplit ? "grid-cols-2" : "grid-cols-1"} overflow-hidden`}>
          <div className="h-full w-full flex bg-[#050508] overflow-hidden">
            <div className="w-12 bg-[#050508] p-4 text-right font-mono text-[11px] text-white/15 select-none space-y-1">
              {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>

            <div className="flex-1 p-4 overflow-auto v2-scrollbar">
              {activeFile ? (
                <textarea
                  value={activeFile.content || ""}
                  onChange={(e) => handleEditContent(e.target.value, "left")}
                  className="w-full h-full bg-transparent text-slate-100 font-mono text-xs outline-none resize-none leading-relaxed"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 text-xs font-mono space-y-2">
                  <span>No active file open.</span>
                  <button onClick={() => handleOpenFile(currentFiles[0]?.name || "main.py")} className="text-indigo-400 hover:underline">
                    Open Default File
                  </button>
                </div>
              )}
            </div>
          </div>

          {isSplit && activeSplitFile && (
            <div className="h-full w-full flex bg-[#050508] border-l border-white/[0.04] overflow-hidden">
              <div className="w-12 bg-[#050508] p-4 text-right font-mono text-[11px] text-white/15 select-none space-y-1">
                {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>

              <div className="flex-1 p-4 overflow-auto v2-scrollbar">
                <textarea
                  value={activeSplitFile.content || ""}
                  onChange={(e) => handleEditContent(e.target.value, "right")}
                  className="w-full h-full bg-transparent text-slate-100 font-mono text-xs outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. SLIDE-OVER FLOATING GLASS FILE DRAWER */}
      {showFileDrawer && (
        <div className="absolute top-16 left-6 z-50 w-72 p-4 rounded-2xl bg-[#0a0a0e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Workspace Files</span>
            <button onClick={() => setShowFileDrawer(false)} className="text-slate-400 hover:text-white">
              ×
            </button>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto v2-scrollbar">
            {currentFiles.map((file) => (
              <div
                key={file.name}
                onClick={() => handleOpenFile(file.name)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                  activeTab === file.name
                    ? "bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {file.isNotebook ? <FaLaptopCode className="text-purple-400 shrink-0" /> : <FaFileCode className="text-indigo-400 shrink-0" />}
                  <span className="truncate">{file.name}</span>
                </div>
                {dirtyFiles.has(file.name) && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QUICK OPEN SEARCH MODAL (⌘P) */}
      {showQuickSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24" onClick={() => setShowQuickSearch(false)}>
          <div className="w-full max-w-lg p-4 rounded-2xl bg-[#0e0e14]/95 border border-white/10 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#050508] border border-white/10">
              <FaSearch className="text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Type filename to open..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-xs text-white outline-none font-sans"
              />
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto v2-scrollbar">
              {currentFiles
                .filter((f) => f && f.name && f.name.toLowerCase().includes((globalSearchQuery || "").toLowerCase()))
                .map((f) => (
                  <div
                    key={f.name}
                    onClick={() => handleOpenFile(f.name)}
                    className="p-2.5 rounded-lg hover:bg-indigo-600/20 text-xs text-slate-200 cursor-pointer flex items-center justify-between"
                  >
                    <span>{f.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">Workspace File</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING GLASS COPILOT DRAWER (⌘K) */}
      {showCopilotOverlay && (
        <div className="absolute top-16 right-6 z-50 w-80 p-4 rounded-2xl bg-[#09090e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <FaBrain className="text-indigo-400" />
              <span>Cursor Copilot (⌘K)</span>
            </div>
            <button onClick={() => setShowCopilotOverlay(false)} className="text-slate-400 hover:text-white">
              ×
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto v2-scrollbar">
            {aiChatLogs.map((log, i) => (
              <div key={i} className={`p-3 rounded-xl text-xs leading-relaxed ${log.sender === "agent" ? "bg-[#050508] border border-white/[0.04] text-slate-300" : "bg-indigo-600/20 text-indigo-100"}`}>
                {log.text}
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Generate code with AI (Press Enter)..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={handleAiPromptSubmit}
            className="w-full p-2.5 rounded-xl bg-[#050508] border border-white/10 text-xs text-white outline-none focus:border-indigo-500 font-sans"
          />
        </div>
      )}

      {/* 6. FLOATING OVERLAY TERMINAL (⌘~) */}
      {showTerminalOverlay && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl p-4 rounded-2xl bg-[#0a0a0e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-mono">
            <span className="text-indigo-400 font-semibold">Terminal Overlay (⌘~)</span>
            <button onClick={() => setShowTerminalOverlay(false)} className="text-slate-400 hover:text-white">
              ×
            </button>
          </div>

          <div className="h-44 p-3 font-mono text-xs overflow-y-auto v2-scrollbar bg-[#050508] rounded-xl text-slate-300 space-y-1">
            {terminalStdout.map((line, i) => (
              <div key={i} className={line.type === "error" ? "text-rose-400" : line.type === "input" ? "text-indigo-300 font-bold" : "text-slate-300"}>
                {line.text}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-emerald-400 font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalSubmit}
                className="flex-1 bg-transparent text-white outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(CodingWorkspacePage);
