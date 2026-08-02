import React from "react";
import { Bot, Activity, CheckCircle2 } from "lucide-react";
import executionMonitor from "../../services/ai/agents/executionMonitor.js";
import capabilityRegistry from "../../services/ai/agents/capabilityRegistry.js";

export function RunningAgentsWidget() {
  const metrics = executionMonitor.getMetrics();
  const roles = capabilityRegistry.getAllRoles();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-cyan-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-tight">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Multi-Agent Status</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 font-mono font-semibold">
          <Activity className="w-3 h-3 animate-pulse text-cyan-400" />
          <span>Active: {metrics.activeTasks}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs">
        <div className="p-3 rounded-xl bg-[#080A10] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">Completed</div>
          <div className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5">{metrics.completedTasks}</div>
        </div>
        <div className="p-3 rounded-xl bg-[#080A10] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">Roles</div>
          <div className="text-lg font-mono font-extrabold text-cyan-400 mt-0.5">{roles.length}</div>
        </div>
      </div>

      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 desktop-scrollbar">
        {roles.slice(0, 4).map((r) => (
          <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-[#080A10]/60 border border-white/[0.05] text-xs">
            <span className="font-medium text-slate-200">{r.id}</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RunningAgentsWidget;
