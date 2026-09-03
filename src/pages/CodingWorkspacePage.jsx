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
import eventBus from "../services/plugins/eventBus.js";

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

  // Search Queries & Drawer Filtering
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [drawerSearchQuery, setDrawerSearchQuery] = useState("");
  const [quickSelectedIndex, setQuickSelectedIndex] = useState(0);

  // Copilot Stream & Prompt
  const [aiPrompt, setAiPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [pendingDiffCode, setPendingDiffCode] = useState(null);
  const [aiChatLogs, setAiChatLogs] = useState([
    { sender: "agent", text: "✨ Inline AI Copilot active (⌘I). Type instructions to generate zero-allocation code diffs." },
  ]);

  // Terminal Shell State
  const terminalInputRef = useRef(null);
  const terminalEndRef = useRef(null);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalStdout, setTerminalStdout] = useState([
    { text: `[${new Date().toLocaleTimeString()}] 🚀 Sacred Studio Canvas Shell`, type: "info" },
    { text: `Active Environment: ${activeWorkspace.toUpperCase()} • Type 'help' for CLI utilities.`, type: "info" },
    { text: "", type: "info" },
  ]);

  // Terminal Auto-Scroll Effect
  useEffect(() => {
    if (showTerminalOverlay) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalStdout, showTerminalOverlay]);

  // Global Keyboard Shortcuts (⌘B, ⌘I, ⌘P, ⌘~) with Clean Unsubscribe
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmd = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (isCmd && key === "enter" && showCopilotOverlay && pendingDiffCode) {
        e.preventDefault();
        handleAcceptDiff();
        return;
      }

      if (isCmd && key === "b") {
        e.preventDefault();
        setShowFileDrawer((prev) => {
          const next = !prev;
          if (next) {
            setShowCopilotOverlay(false);
            setShowQuickSearch(false);
            setShowTerminalOverlay(false);
          }
          return next;
        });
      } else if (isCmd && (key === "k" || key === "i")) {
        e.preventDefault();
        setShowCopilotOverlay((prev) => {
          const next = !prev;
          if (next) {
            setShowFileDrawer(false);
            setShowQuickSearch(false);
            setShowTerminalOverlay(false);
          }
          return next;
        });
      } else if (isCmd && key === "p") {
        e.preventDefault();
        setShowQuickSearch((prev) => {
          const next = !prev;
          if (next) {
            setShowFileDrawer(false);
            setShowCopilotOverlay(false);
            setShowTerminalOverlay(false);
          }
          return next;
        });
      } else if (isCmd && key === "~") {
        e.preventDefault();
        setShowTerminalOverlay((prev) => {
          const next = !prev;
          if (next) {
            setShowFileDrawer(false);
            setShowCopilotOverlay(false);
            setShowQuickSearch(false);
          }
          return next;
        });
      } else if (e.key === "Escape") {
        if (showCopilotOverlay && pendingDiffCode) {
          setPendingDiffCode(null);
        } else {
          setShowCopilotOverlay(false);
          setShowQuickSearch(false);
          setShowTerminalOverlay(false);
          setShowFileDrawer(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCopilotOverlay, pendingDiffCode]);

  // Phase 3.6 — Assistant -> Studio Code Transfer State
  const [insertedToastMsg, setInsertedToastMsg] = useState(null);
  const processedInsertIds = useRef(new Set());

  // Persistence & Phase 5 Studio Context Exporter for AI Orchestrator
  useEffect(() => {
    const safeTabs = Array.isArray(openTabs) ? openTabs : ["main.py"];
    localStorage.setItem(STORAGE_KEYS.OPEN_TABS, JSON.stringify(safeTabs));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab || "main.py");
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE, activeWorkspace || "python");

    if (typeof window !== "undefined") {
      window.activeStudioContext = {
        activeTab: activeTab || "main.py",
        activeWorkspace: activeWorkspace || "python",
        activeContent: activeFile?.content || "",
        language: (activeTab || "").endsWith(".py") ? "python" : (activeTab || "").endsWith(".js") ? "javascript" : "typescript",
      };
      // Phase 6: Expose full workspace data for Agent Scanner
      window.studioWorkspacesData = workspacesData;
    }
  }, [openTabs, activeTab, activeWorkspace, activeFile, workspacesData]);

  // Phase 3.6 — Live EventBus & Cold Mount Queue Receiver
  useEffect(() => {
    const handleInsertEvent = (payload) => {
      try {
        if (!payload) return;
        const codeText = typeof payload === "string" ? payload : payload.code;
        const payloadId = payload.id || codeText;

        // Prevent duplicate insertion
        if (!codeText || processedInsertIds.current.has(payloadId)) return;
        processedInsertIds.current.add(payloadId);

        setWorkspacesData((prev) => {
          const files = prev[activeWorkspace] || [];
          const targetTabName = activeTab || (files[0]?.name) || "main.py";
          const fileExists = files.some((f) => f && f.name === targetTabName);

          if (fileExists) {
            const updated = files.map((f) => {
              if (f && f.name === targetTabName) {
                const currentContent = f.content || "";
                return {
                  ...f,
                  content: currentContent ? `${currentContent}\n\n# --- Inserted from Assistant ---\n${codeText}` : codeText
                };
              }
              return f;
            });
            return { ...prev, [activeWorkspace]: updated };
          } else {
            const newFileName = payload.filename || "assistant_code.py";
            return {
              ...prev,
              [activeWorkspace]: [...files, { name: newFileName, content: codeText, isNotebook: false }]
            };
          }
        });

        if (activeTab) {
          setDirtyFiles((prev) => new Set(prev).add(activeTab));
        }

        setInsertedToastMsg("✓ Code inserted into Studio");
        setTimeout(() => setInsertedToastMsg(null), 3000);
      } catch {
        setInsertedToastMsg("Unable to insert into Studio (Retry)");
        setTimeout(() => setInsertedToastMsg(null), 3500);
      }
    };

    // Subscribe to eventBus
    const unsubscribe = eventBus.subscribe ? eventBus.subscribe("INSERT_CODE_STUDIO", handleInsertEvent) : null;

    // Consume pending queue from localStorage on mount
    try {
      const queueRaw = localStorage.getItem("pending_studio_queue");
      const legacyRaw = localStorage.getItem("pending_studio_code");

      if (queueRaw) {
        const queue = JSON.parse(queueRaw);
        if (Array.isArray(queue) && queue.length > 0) {
          queue.forEach((item) => handleInsertEvent(item));
          localStorage.removeItem("pending_studio_queue");
          localStorage.removeItem("pending_studio_code");
        }
      } else if (legacyRaw) {
        handleInsertEvent({ code: legacyRaw });
        localStorage.removeItem("pending_studio_code");
      }
    } catch {
      // Ignore storage parse errors
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab, activeWorkspace]);

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

  const handleCreateNewFile = () => {
    const newName = prompt("Enter new filename:", "untitled.py");
    if (!newName || !newName.trim()) return;
    const cleanName = newName.trim();
    setWorkspacesData((prev) => {
      const existing = prev[activeWorkspace] || [];
      if (existing.some((f) => f && f.name === cleanName)) return prev;
      return {
        ...prev,
        [activeWorkspace]: [...existing, { name: cleanName, content: `# ${cleanName}\n`, isNotebook: cleanName.endsWith(".ipynb") }]
      };
    });
    handleOpenFile(cleanName);
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
      if (!aiPrompt.trim() || isThinking) return;
      const text = aiPrompt.trim();
      setAiPrompt("");
      setIsThinking(true);
      setAiChatLogs((prev) => [...prev, { sender: "user", text }]);

      setTimeout(() => {
        setIsThinking(false);
        const generatedSnippet = `# AI Generated Enhancement for ${activeTab}\n# Instruction: ${text}\n\ndef optimized_inline_pipeline():\n    \"\"\"Zero-allocation inline execution pipeline\"\"\"\n    print("Executing inline diff: ${text}")\n    return True\n`;
        setPendingDiffCode(generatedSnippet);
        setAiChatLogs((prev) => [
          ...prev,
          {
            sender: "agent",
            text: `✨ Generated code diff for '${text}'. Review preview below and press ⌘Enter to Accept.`,
            diffCode: generatedSnippet
          },
        ]);
      }, 700);
    }
  };

  const handleAcceptDiff = () => {
    if (!pendingDiffCode || !activeTab) return;
    const existingContent = activeFile?.content || "";
    const updatedContent = existingContent ? `${existingContent}\n\n${pendingDiffCode}` : pendingDiffCode;
    handleEditContent(updatedContent, "left");
    setPendingDiffCode(null);
    setAiChatLogs((prev) => [...prev, { sender: "agent", text: "✅ Applied inline code diff into active editor buffer." }]);
  };

  const handleRejectDiff = () => {
    setPendingDiffCode(null);
  };

  const safeOpenTabs = Array.isArray(openTabs) ? openTabs : ["main.py"];

  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 flex flex-col font-sans overflow-hidden select-none relative">
      {/* 1. FLOATING CONTROL PILL (PHASE 3.1 DESIGN SPECIFICATION) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0E0E14]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl transition-all">
        <button
          onClick={() => setShowFileDrawer(!showFileDrawer)}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            showFileDrawer
              ? "bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/30 font-semibold"
              : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
          }`}
          title="Toggle File Drawer (⌘B)"
        >
          <FaFolderOpen className="text-[#6366F1]" />
          <span>Files</span>
        </button>

        <span className="text-white/10 select-none">|</span>

        <div className="flex items-center gap-2 text-xs font-mono px-1">
          <span className="font-semibold text-white tracking-tight">{activeTab || "No File"}</span>
          {dirtyFiles.has(activeTab) && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shadow-sm" title="Unsaved changes" />}
        </div>

        <span className="text-white/10 select-none">|</span>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowCopilotOverlay(!showCopilotOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all font-mono border ${
              showCopilotOverlay
                ? "bg-[#6366F1]/25 text-white border-[#6366F1]/50 shadow-md font-semibold"
                : "bg-[#6366F1]/15 text-[#6366F1] border-[#6366F1]/30 hover:bg-[#6366F1]/25"
            }`}
            title="Inline AI Copilot (⌘I / ⌘K)"
          >
            <span className="font-bold">⌘I</span>
            <span className="font-sans font-medium text-[11px]">Copilot</span>
          </button>

          <button
            onClick={() => setShowQuickSearch(!showQuickSearch)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all border ${
              showQuickSearch
                ? "bg-white/15 text-white border-white/20"
                : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08] hover:text-white"
            }`}
            title="Quick File Finder (⌘P)"
          >
            <span>⌘P</span>
          </button>

          <button
            onClick={() => setShowTerminalOverlay(!showTerminalOverlay)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all border ${
              showTerminalOverlay
                ? "bg-white/15 text-white border-white/20"
                : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08] hover:text-white"
            }`}
            title="Floating Terminal (⌘~)"
          >
            <span>⌘~</span>
          </button>

          <button
            onClick={handleToggleSplit}
            className={`p-1.5 rounded-full transition-all ${
              isSplit ? "bg-[#6366F1]/20 text-[#6366F1] font-bold" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
            title="Toggle Split View Canvas"
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
                <button onClick={(e) => handleCloseTab(tabName, e)} aria-label={`Close ${tabName} tab`} className="text-slate-500 hover:text-slate-200 text-xs ml-1">
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
                  aria-label="Active Studio Editor Canvas"
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

      {/* 3. SLIDE-OVER FLOATING GLASS FILE DRAWER (PHASE 3.2 SPECIFICATION) */}
      {showFileDrawer && (
        <div className="absolute top-16 left-4 z-50 w-[280px] p-4 rounded-2xl bg-[#0E0E14]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl space-y-3 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in fade-in slide-in-from-left-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-2">
              <FaFolderOpen className="text-[#6366F1] text-xs" />
              <span className="text-xs font-bold text-white tracking-tight">Workspace Files</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNewFile}
                className="px-2 py-0.5 rounded-lg bg-[#6366F1]/20 hover:bg-[#6366F1]/30 text-[#6366F1] border border-[#6366F1]/30 text-[11px] font-medium transition-all"
                title="Create new file"
              >
                + File
              </button>
              <button onClick={() => setShowFileDrawer(false)} aria-label="Close Drawer" className="text-slate-400 hover:text-white p-1 text-xs" title="Close (Esc)">
                ×
              </button>
            </div>
          </div>

          {/* File Search Input */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#050508] border border-white/10">
            <FaSearch className="text-slate-500 text-[10px]" />
            <input
              type="text"
              aria-label="Search files"
              placeholder="Search files (⌘B)..."
              value={drawerSearchQuery}
              onChange={(e) => setDrawerSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white outline-none font-sans placeholder:text-slate-500"
            />
          </div>

          {/* Workspace Tree List */}
          <div className="space-y-1 max-h-80 overflow-y-auto v2-scrollbar">
            {currentFiles
              .filter((f) => f && f.name && f.name.toLowerCase().includes((drawerSearchQuery || "").toLowerCase()))
              .map((file) => (
                <div
                  key={file.name}
                  onClick={() => handleOpenFile(file.name)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                    activeTab === file.name
                      ? "bg-[#6366F1]/20 text-white font-medium border border-[#6366F1]/40"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.isNotebook ? <FaLaptopCode className="text-purple-400 shrink-0" /> : <FaFileCode className="text-[#6366F1] shrink-0" />}
                    <span className="truncate">{file.name}</span>
                  </div>
                  {dirtyFiles.has(file.name) && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" title="Unsaved changes" />}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. FLOATING QUICK OPEN SEARCH MODAL (⌘P) (PHASE 3.3 SPECIFICATION) */}
      {showQuickSearch && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-start justify-center pt-20 transition-all duration-200 animate-in fade-in"
          onClick={() => setShowQuickSearch(false)}
        >
          <div
            className="w-full max-w-[560px] p-4 rounded-2xl bg-[#0E0E14]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#050508] border border-white/10 focus-within:border-[#6366F1]/50 transition-all">
              <FaSearch className="text-[#6366F1] text-sm shrink-0" />
              <input
                type="text"
                aria-label="Quick File Search"
                placeholder="Type filename to open (⌘P)..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setQuickSelectedIndex(0);
                }}
                onKeyDown={(e) => {
                  const filtered = currentFiles.filter(
                    (f) => f && f.name && f.name.toLowerCase().includes((globalSearchQuery || "").toLowerCase())
                  );
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setQuickSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setQuickSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (filtered[quickSelectedIndex]) {
                      handleOpenFile(filtered[quickSelectedIndex].name);
                    }
                  } else if (e.key === "Escape") {
                    setShowQuickSearch(false);
                  }
                }}
                autoFocus
                className="w-full bg-transparent text-sm text-white outline-none font-sans placeholder:text-slate-500"
              />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/10 shrink-0">
                Esc to close
              </span>
            </div>

            {/* Results & Recent Files List */}
            <div className="space-y-1 max-h-72 overflow-y-auto v2-scrollbar">
              {!globalSearchQuery && (
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Recent Files & Workspace Items</span>
                  <span className="text-slate-600">{currentFiles.length} files</span>
                </div>
              )}

              {currentFiles
                .filter((f) => f && f.name && f.name.toLowerCase().includes((globalSearchQuery || "").toLowerCase()))
                .map((f, idx) => {
                  const isSelected = idx === quickSelectedIndex;
                  const isActiveTab = activeTab === f.name;

                  return (
                    <div
                      key={f.name}
                      onClick={() => handleOpenFile(f.name)}
                      onMouseEnter={() => setQuickSelectedIndex(idx)}
                      className={`p-3 rounded-xl text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-[#6366F1]/20 text-white font-medium border border-[#6366F1]/40"
                          : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {f.isNotebook ? (
                          <FaLaptopCode className="text-purple-400 shrink-0" />
                        ) : (
                          <FaFileCode className="text-[#6366F1] shrink-0" />
                        )}
                        <span className="truncate font-mono">{f.name}</span>
                        {isActiveTab && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        {dirtyFiles.has(f.name) && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" title="Unsaved changes" />}
                        <span>Press Enter ↵</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING INLINE AI COPILOT PANEL (⌘I) (PHASE 3.5 SPECIFICATION) */}
      {showCopilotOverlay && (
        <div className="absolute top-16 right-6 z-50 w-full max-w-[520px] p-4 rounded-2xl bg-[#0E0E14]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl space-y-3 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in fade-in slide-in-from-right-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-mono select-none">
            <div className="flex items-center gap-2">
              <FaBrain className="text-[#6366F1]" />
              <span className="text-white font-bold tracking-tight">Inline AI Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
                ⌘I
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/10">
                Claude 3.5
              </span>
            </div>
            <button
              onClick={() => setShowCopilotOverlay(false)}
              className="text-slate-400 hover:text-white p-1 text-xs"
              title="Close (Esc)"
              aria-label="Close Copilot"
            >
              ×
            </button>
          </div>

          {/* Thinking / Streaming Indicator */}
          {isThinking && (
            <div className="text-xs font-mono text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
              <span>⚡ Thinking & synthesizing code diff...</span>
            </div>
          )}

          {/* Chat / Interaction History */}
          <div className="space-y-2 max-h-56 overflow-y-auto v2-scrollbar">
            {aiChatLogs.map((log, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  log.sender === "agent"
                    ? "bg-[#050508] border border-white/[0.04] text-slate-300"
                    : "bg-[#6366F1]/20 border border-[#6366F1]/30 text-white font-medium"
                }`}
              >
                {log.text}
              </div>
            ))}
          </div>

          {/* Diff Preview Container */}
          {pendingDiffCode && (
            <div className="p-3.5 rounded-xl bg-[#050508] border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 border-b border-white/[0.06] pb-1.5">
                <span>Proposed Code Addition</span>
                <span className="text-[10px] text-slate-500">Press ⌘Enter to Accept</span>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto v2-scrollbar p-2 bg-[#0A0A0E] rounded-lg border border-white/5 leading-relaxed">
                <code>{pendingDiffCode}</code>
              </pre>
            </div>
          )}

          {/* Prompt Input Box */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#050508] border border-white/10 focus-within:border-[#6366F1]/50 transition-all font-sans">
            <input
              type="text"
              aria-label="Ask AI Assistant"
              placeholder="Ask AI to modify this code..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={handleAiPromptSubmit}
              autoFocus
              className="flex-1 bg-transparent text-xs text-white outline-none font-sans placeholder:text-slate-500"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAiPromptSubmit}
                disabled={!aiPrompt.trim() || isThinking}
                className="px-3 py-1 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium disabled:opacity-40 transition-all"
              >
                Generate
              </button>

              {pendingDiffCode && (
                <>
                  <button
                    type="button"
                    onClick={handleAcceptDiff}
                    className="px-3 py-1 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium transition-all flex items-center gap-1"
                  >
                    <span>Accept</span>
                    <span className="text-[10px] font-mono opacity-80">(⌘Enter)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectDiff}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs transition-all"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCopilotOverlay(false)}
              className="text-slate-500 hover:text-slate-300 text-[11px] font-mono"
            >
              Esc to close
            </button>
          </div>
        </div>
      )}

      {/* 6. FLOATING TERMINAL OVERLAY (⌘~) (PHASE 3.4 SPECIFICATION) */}
      {showTerminalOverlay && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[800px] h-[340px] p-4 rounded-2xl bg-[#0E0E14]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl flex flex-col justify-between transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-mono select-none">
            <div className="flex items-center gap-2.5">
              <FaTerminal className="text-[#6366F1]" />
              <span className="text-white font-semibold tracking-tight">Terminal Overlay</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
                ENV: {activeWorkspace.toUpperCase()}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[#10B981] font-mono pl-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setTerminalStdout([])}
                className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all text-[10px]"
                title="Clear stdout logs"
              >
                Clear
              </button>
              <button
                onClick={() => setShowTerminalOverlay(false)}
                className="text-slate-400 hover:text-white p-1"
                title="Close (Esc)"
                aria-label="Close Terminal"
              >
                ×
              </button>
            </div>
          </div>

          {/* Terminal Output Body */}
          <div className="flex-1 my-2.5 p-3.5 bg-[#050508] border border-white/[0.04] rounded-xl overflow-y-auto font-mono text-xs space-y-1.5 v2-scrollbar leading-relaxed">
            {terminalStdout.map((line, i) => (
              <div
                key={i}
                className={
                  line.type === "error"
                    ? "text-[#EF4444]"
                    : line.type === "input"
                    ? "text-[#6366F1] font-semibold"
                    : "text-slate-300"
                }
              >
                {line.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Interactive Footer Input Prompt */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#050508] border border-white/10 focus-within:border-[#6366F1]/50 transition-all font-mono text-xs">
            <span className="text-[#10B981] font-bold select-none">$</span>
            <input
              ref={terminalInputRef}
              type="text"
              aria-label="Terminal CLI Command"
              placeholder="Type CLI command (e.g. python main.py, help, ls)..."
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleTerminalSubmit}
              autoFocus
              className="flex-1 bg-transparent text-white outline-none font-mono text-xs placeholder:text-slate-600"
            />
            <span className="text-[10px] text-slate-500 select-none">Press Enter ↵</span>
          </div>
        </div>
      )}

      {/* Phase 3.6 — Code Insertion Toast Banner */}
      {insertedToastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-mono backdrop-blur-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{insertedToastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default React.memo(CodingWorkspacePage);
