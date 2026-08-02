import React from "react";
import { BookOpen } from "lucide-react";

export function CitationCard({ chunks = [] }) {
  if (!chunks || chunks.length === 0) return null;

  return (
    <div className="mt-3 p-3 rounded-lg border border-indigo-500/30 bg-slate-900/90 text-xs">
      <div className="flex items-center gap-2 text-indigo-300 font-medium mb-2">
        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
        <span>RAG Knowledge Citations ({chunks.length})</span>
      </div>
      <div className="space-y-2">
        {chunks.map((c, idx) => (
          <div key={idx} className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Source #{idx + 1} ({c.provider})</span>
              <span>Score: {c.finalScore || c.score}</span>
            </div>
            <p className="mt-1 text-slate-300 text-[11px]">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CitationCard;
