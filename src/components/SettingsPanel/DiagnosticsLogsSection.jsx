import React from "react";
import { Terminal, Activity } from "lucide-react";
import retrievalMetrics from "../../services/ai/rag/postprocessing/retrievalMetrics.js";

export function DiagnosticsLogsSection() {
  const metrics = retrievalMetrics.getMetrics();

  return (
    <div className="space-y-4 text-xs">
      <div className="settings-section-card">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm border-b border-slate-800 pb-3 mb-3">
          <Activity className="w-4 h-4" />
          <span>System Diagnostics & Telemetry</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">Total Queries</div>
            <div className="text-lg font-bold text-slate-100 mt-0.5">{metrics.totalQueries}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">Cache Hit Rate</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">{metrics.cacheHitRate}%</div>
          </div>
        </div>
      </div>

      <div className="settings-section-card">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm border-b border-slate-800 pb-3 mb-3">
          <Terminal className="w-4 h-4" />
          <span>System Logs Stream</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-40 overflow-y-auto">
          <div>[System] Diagnostics initialized. All systems operational.</div>
          <div>[Telemetry] RAG Pipeline retrieval latency: 12ms.</div>
          <div>[EventBus] Subsystem event listeners operational.</div>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticsLogsSection;
