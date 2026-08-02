import React from "react";
import { Eye, X, Activity, Database, GitMerge } from "lucide-react";
import retrievalMetrics from "../../services/ai/rag/postprocessing/retrievalMetrics.js";

export function RightInspector({ isOpen, onClose }) {
  if (!isOpen) return null;

  const metrics = retrievalMetrics.getMetrics();

  return (
    <div className="w-64 bg-[#09090b] border-l border-white/[0.06] p-4 flex flex-col h-full z-20 text-xs text-slate-300 shrink-0 select-none">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
        <div className="flex items-center gap-2 text-slate-200 font-semibold tracking-tight">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>Context Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto v2-scrollbar pr-0.5">
        <div className="p-3 rounded-lg bg-[#121218] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>RAG Query Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="bg-[#09090b] p-2 rounded border border-white/[0.06]">
              <span className="text-slate-400 text-[10px] block">Total</span>
              <span className="text-slate-100 font-bold">{metrics.totalQueries}</span>
            </div>
            <div className="bg-[#09090b] p-2 rounded border border-white/[0.06]">
              <span className="text-slate-400 text-[10px] block">Cache Rate</span>
              <span className="text-indigo-300 font-bold">{metrics.cacheHitRate}%</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#121218] border border-white/[0.06]">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Memory Engine</span>
          </div>
          <div className="text-[11px] text-slate-300 leading-relaxed">Transient session storage active with 30m TTL.</div>
        </div>
      </div>
    </div>
  );
}

export default RightInspector;
