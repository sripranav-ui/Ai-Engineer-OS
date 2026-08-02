import React from "react";
import { Play, Bot, GitBranch } from "lucide-react";
import { workflowService } from "../../services/ai/workflow/workflowService.js";
import { collaborationEngine } from "../../services/ai/agents/collaborationEngine.js";

export function QuickActionsCard() {
  const handleTriggerAgent = () => {
    collaborationEngine.executeGoal("Quick Operations Health Audit");
    alert("Triggered multi-agent execution goal!");
  };

  const handleTriggerWorkflow = () => {
    const list = workflowService.listWorkflows();
    if (list.length > 0) {
      workflowService.runWorkflow(list[0].id);
      alert(`Triggered workflow "${list[0].name}"!`);
    } else {
      alert("No workflow definitions registered yet.");
    }
  };

  return (
    <div className="col-span-12 md:col-span-8 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 transition-all duration-200 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-100 tracking-tight">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Play className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <span>Quick Execution Launchers</span>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={handleTriggerAgent}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Dispatch Agent</span>
        </button>

        <button
          onClick={handleTriggerWorkflow}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#080A10] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-medium transition-all active:scale-[0.98]"
        >
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          <span>Run Workflow</span>
        </button>
      </div>
    </div>
  );
}

export default QuickActionsCard;
