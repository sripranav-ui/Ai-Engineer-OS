import React from "react";
import { CheckSquare } from "lucide-react";
import taskQueue from "../../services/ai/agents/tasks/taskQueue.js";

export function TaskProgressWidget() {
  const tasks = taskQueue.getAllTasks();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-tight">
          <CheckSquare className="w-4 h-4 text-indigo-400" />
          <span>Task Queue Progress</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-mono font-semibold">Total: {tasks.length}</span>
      </div>

      <div className="space-y-2 max-h-36 overflow-y-auto pr-1 desktop-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4 font-mono">No active queued tasks.</div>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="p-2.5 rounded-xl bg-[#080A10]/80 border border-white/[0.05] text-xs flex items-center justify-between">
              <span className="truncate text-slate-200 font-medium">{t.title}</span>
              <span className="text-[10px] text-indigo-400 font-mono font-semibold uppercase">{t.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TaskProgressWidget;
