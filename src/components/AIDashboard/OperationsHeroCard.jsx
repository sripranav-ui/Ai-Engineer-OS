import React from "react";
import { Activity, CheckCircle2, Cpu } from "lucide-react";
import workspaceContextService from "../../services/ai/memory/workspaceContextService.js";

export function OperationsHeroCard() {
  const ctx = workspaceContextService.getContext();

  return (
    <div className="col-span-12 p-7 rounded-2xl bg-gradient-to-r from-[#0E121E]/95 via-[#131726]/95 to-[#0E121E]/95 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)] relative overflow-hidden group">
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all" />
      <div className="absolute left-1/3 top-0 w-60 h-60 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-400 tracking-wider uppercase">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span className="font-semibold">Autonomous Operations Engine Active</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Operations Center — AI Engineer OS</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Multi-agent orchestrator, hybrid RAG pipeline, and workflow automation active for workspace{" "}
            <span className="text-indigo-300 font-semibold underline decoration-indigo-500/40 underline-offset-4">
              {ctx.workspaceName || "AI Engineer OS"}
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-[#080A10]/90 border border-white/10 font-mono text-xs text-slate-200 flex items-center gap-2.5 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">System Health: 200 OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperationsHeroCard;
