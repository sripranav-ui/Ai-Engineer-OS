import React from "react";
import { Clock } from "lucide-react";
import executionHistory from "../../services/ai/agents/executionHistory.js";

export function RecentActionsWidget() {
  const history = executionHistory.getHistory();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-cyan-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-tight">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Execution Audit Timeline</span>
        </div>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 desktop-scrollbar">
        {history.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4 font-mono">No recent executions recorded.</div>
        ) : (
          history.slice(0, 5).map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-[#080A10]/90 border border-white/[0.06] text-xs space-y-1">
              <div className="font-semibold text-slate-100 truncate">{item.goalText || "Goal Execution"}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="text-emerald-400 font-semibold uppercase">{item.status}</span>
                <span>{new Date(item.timestamp || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentActionsWidget;
