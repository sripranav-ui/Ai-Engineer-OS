import React from "react";
import { Zap, Clock, Play } from "lucide-react";
import { workflowService } from "../../services/ai/workflow/workflowService.js";

export function AutomationWindow() {
  const workflows = workflowService.listWorkflows();

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans desktop-scrollbar">
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/[0.07]">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-violet-500/20 border border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/10">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Automation & Cron Scheduler</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage recurring cron triggers, automated webhooks, and background jobs</p>
        </div>
      </div>

      <div className="space-y-3 max-w-4xl">
        {workflows.map((wf) => (
          <div key={wf.id} className="p-5 rounded-2xl bg-[#0F1320]/90 backdrop-blur-xl border border-white/[0.07] hover:border-indigo-500/30 transition-all shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-100 tracking-tight">{wf.name}</div>
              <div className="text-xs text-slate-400 max-w-xl">{wf.description || "Automated background DAG workflow trigger"}</div>
            </div>
            <button
              onClick={() => workflowService.runWorkflow(wf.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trigger Now</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutomationWindow;
