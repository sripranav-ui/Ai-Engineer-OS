import React, { useState } from "react";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";

export function ThinkingIndicator({ thoughtProcess = "Analyzing user prompt, retrieving RAG knowledge, and generating optimized response plan..." }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3 rounded-lg border border-indigo-500/30 bg-indigo-950/20 text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-indigo-300 font-medium hover:bg-indigo-900/20 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Thought Process</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-indigo-500/20 text-slate-300 font-mono text-[11px] leading-relaxed">
          {thoughtProcess}
        </div>
      )}
    </div>
  );
}

export default ThinkingIndicator;
