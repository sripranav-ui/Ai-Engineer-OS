import React from "react";
import { Eye, X } from "lucide-react";

export function ContextPreview({ isOpen, onClose, contextText = "" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 p-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
          <Eye className="w-4 h-4" />
          <span>System Context Preview</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
        {contextText || "No context payload loaded."}
      </div>
    </div>
  );
}

export default ContextPreview;
