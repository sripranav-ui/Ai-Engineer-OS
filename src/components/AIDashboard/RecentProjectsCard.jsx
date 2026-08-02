import React from "react";
import { Folder, CheckCircle2 } from "lucide-react";
import workspaceContextService from "../../services/ai/memory/workspaceContextService.js";

export function RecentProjectsCard() {
  const ctx = workspaceContextService.getContext();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-tight">
          <Folder className="w-4 h-4 text-indigo-400" />
          <span>Active Project Workspace</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">Current Context</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-slate-100 tracking-tight">{ctx.activeProject ? ctx.activeProject.title : "AI Engineer OS Platform"}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">Autonomous multi-agent platform architecture & workflow studio</p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">Status:</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active
        </span>
      </div>
    </div>
  );
}

export default RecentProjectsCard;
