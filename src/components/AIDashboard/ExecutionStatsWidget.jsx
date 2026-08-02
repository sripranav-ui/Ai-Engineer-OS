import React from "react";
import { BarChart2 } from "lucide-react";
import retrievalMetrics from "../../services/ai/rag/postprocessing/retrievalMetrics.js";

export function ExecutionStatsWidget() {
  const metrics = retrievalMetrics.getMetrics();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-tight">
          <BarChart2 className="w-4 h-4 text-indigo-400" />
          <span>Execution & Cache Statistics</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3.5 rounded-xl bg-[#080A10] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">Total Queries</div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1 font-mono">{metrics.totalQueries}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#080A10] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">Hit Rate</div>
          <div className="text-2xl font-extrabold text-indigo-400 mt-1 font-mono">{metrics.cacheHitRate}%</div>
        </div>
      </div>
    </div>
  );
}

export default ExecutionStatsWidget;
