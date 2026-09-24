import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../Common/StatusBadge.jsx";
import Button from "../Common/Button.jsx";
import { Search, Sparkles, Lightbulb, Bug, Compass, Terminal, ShieldCheck } from "lucide-react";

/**
 * TopCommandHeader.jsx — Phase 2 Command Center Header
 * Features:
 * - Compact user identity & engineering rank
 * - Live OS kernel status & active workspace context
 * - Unified Raycast/Spotlight command bar linking to real AI Assistant
 * - Quick action shortcuts for instant code analysis
 */
export function TopCommandHeader({ user, activeWorkspaceName = "AI Engineer OS" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleQuerySubmit = (actionType = "ask") => {
    let finalQuery = "";
    if (actionType === "explain") {
      finalQuery = "Explain this Python code block for me: \n";
    } else if (actionType === "debug") {
      finalQuery = "Help me debug this runtime error: \n";
    } else if (actionType === "roadmap") {
      finalQuery = "Generate an optimized study roadmap for learning: ";
    } else {
      finalQuery = query;
    }

    if (finalQuery.trim() || query.trim()) {
      localStorage.setItem(
        "pending_ai_assistant_query",
        finalQuery + (actionType === "ask" ? "" : query)
      );
    }
    navigate("/assistant");
  };

  return (
    <div className="space-y-4">
      {/* ── Top Identity & System Status Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <StatusBadge status="online" pulse={true} size="sm">
            OS KERNEL 6.0 • ONLINE
          </StatusBadge>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-500">Workspace:</span>
            <span className="text-slate-200 font-semibold">{activeWorkspaceName}</span>
            <span className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[10px] text-indigo-400 border border-white/5">
              main
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Identity:</span>
            <span className="text-white font-semibold">{user?.name || "AI Engineer"}</span>
          </div>
          <span className="text-slate-700">•</span>
          <span className="text-[11px] font-mono text-violet-400">
            Level {user?.level || 1}
          </span>
        </div>
      </div>

      {/* ── Unified AI Command Launcher Affordance ── */}
      <div className="relative rounded-2xl bg-[#090C16]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] p-2.5 sm:p-3 transition-all duration-200 hover:border-violet-500/25">
        <div className="flex items-center gap-3 bg-[#060810]/80 rounded-xl px-3.5 py-2 border border-white/[0.05] focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
          <Search className="w-4 h-4 text-violet-400 shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
            placeholder="Search commands, dispatch AI agents, or ask architecture questions... (Press Enter)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuerySubmit("ask");
            }}
          />
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-slate-400 border border-white/10">
            <span>⌘K</span>
          </span>
          <Button
            onClick={() => handleQuerySubmit("ask")}
            type="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Query
          </Button>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 mt-2 px-1 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-slate-500" />
            <span>Shortcuts:</span>
          </span>
          <button
            onClick={() => handleQuerySubmit("explain")}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Explain Code</span>
          </button>
          <button
            onClick={() => handleQuerySubmit("debug")}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Bug className="w-3 h-3 text-rose-400" />
            <span>Debug Error</span>
          </button>
          <button
            onClick={() => handleQuerySubmit("roadmap")}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Compass className="w-3 h-3 text-indigo-400" />
            <span>Study Roadmap</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TopCommandHeader);
