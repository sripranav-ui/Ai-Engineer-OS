import React from "react";
import { GitBranch, Layers } from "lucide-react";
import { workflowService } from "../../services/ai/workflow/workflowService.js";

export function RunningWorkflowsWidget() {
  const workflows = workflowService.listWorkflows();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-purple-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(168,85,247,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs tracking-tight">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <span>Workflow Execution Engine</span>
        </div>
        <div className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-mono font-semibold">
          <span>Templates: {workflows.length}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 desktop-scrollbar">
        {workflows.map((wf) => (
          <div key={wf.id} className="p-3 rounded-xl bg-[#080A10]/90 border border-white/[0.06] text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-100">
              <span>{wf.name}</span>
              <span className="text-[10px] text-purple-400 font-mono font-semibold">v{wf.version || "1.0"}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-indigo-400" /> {wf.nodes?.length || 0} Nodes</span>
              <span>Updated: {new Date(wf.updatedAt || Date.now()).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RunningWorkflowsWidget;
