import React from "react";
import { Code, Activity, Terminal } from "lucide-react";
import retrievalMetrics from "../../services/ai/rag/postprocessing/retrievalMetrics.js";

export function DeveloperToolsWindow() {
  const metrics = retrievalMetrics.getMetrics();

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans desktop-scrollbar">
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/[0.07]">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-violet-500/20 border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/10">
          <Code className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">System Developer Tools</h1>
          <p className="text-xs text-slate-400 mt-0.5">Low-level event bus observer, memory heap inspection, and telemetry debugger</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-[#0F1320]/90 backdrop-blur-xl border border-white/[0.07] hover:border-indigo-500/30 transition-all shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-tight">
            <Activity className="w-4 h-4" />
            <span>RAG Query Metrics</span>
          </div>
          <pre className="p-4 rounded-xl bg-[#090C14] border border-white/[0.06] font-mono text-[11px] text-slate-300 overflow-x-auto shadow-inner leading-relaxed">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F1320]/90 backdrop-blur-xl border border-white/[0.07] hover:border-indigo-500/30 transition-all shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-tight">
            <Terminal className="w-4 h-4" />
            <span>Subsystem Event Bus Stream</span>
          </div>
          <div className="p-4 rounded-xl bg-[#090C14] border border-white/[0.06] font-mono text-[11px] text-slate-300 space-y-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
              <span className="text-slate-400">[EventBus] Active subscribers:</span>
              <span className="text-emerald-400 font-bold">12 Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">[EventBus] Stream Status:</span>
              <span className="text-indigo-400 font-bold">200 OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeveloperToolsWindow;
