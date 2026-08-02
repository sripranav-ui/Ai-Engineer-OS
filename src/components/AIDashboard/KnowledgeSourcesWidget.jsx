import React from "react";
import { BookOpen } from "lucide-react";
import workspaceKnowledgeGraph from "../../services/intelligence/workspaceKnowledgeGraph.js";

export function KnowledgeSourcesWidget() {
  const nodeCount = workspaceKnowledgeGraph.getNodeCount();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-tight">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Knowledge Graph Sources</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#080A10] border border-white/[0.06] text-center">
        <div className="text-3xl font-extrabold text-indigo-400 font-mono">{nodeCount}</div>
        <div className="text-xs text-slate-400 mt-1 font-medium">Knowledge Graph Entities Indexed</div>
      </div>
    </div>
  );
}

export default KnowledgeSourcesWidget;
