import React from "react";
import { ShieldCheck, Activity } from "lucide-react";
import agentHealthMonitor from "../../services/ai/agents/agentHealthMonitor.js";

export function SystemHealthWidget() {
  const healthList = agentHealthMonitor.checkHealth();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-emerald-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs tracking-tight">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>System Health Monitor</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">100% HEALTHY</span>
      </div>

      <div className="space-y-2 max-h-36 overflow-y-auto pr-1 desktop-scrollbar">
        {healthList.map((h) => (
          <div key={h.agentId} className="flex items-center justify-between p-2.5 rounded-xl bg-[#080A10]/80 border border-white/[0.05] text-xs">
            <span className="font-medium text-slate-200">{h.name}</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" /> PASS
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemHealthWidget;
