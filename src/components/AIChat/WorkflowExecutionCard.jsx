import React from "react";
import { GitMerge, CheckCircle, Clock } from "lucide-react";

export function WorkflowExecutionCard({ workflowName = "Workflow Engine", status = "COMPLETED", activeNode = "End Node" }) {
  return (
    <div className="my-2 rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-300 font-medium">
          <GitMerge className="w-4 h-4 text-purple-400" />
          <span>Workflow Execution: {workflowName}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-purple-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{status}</span>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-slate-300 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-purple-400" />
        <span>Active Node: {activeNode}</span>
      </div>
    </div>
  );
}

export default WorkflowExecutionCard;
