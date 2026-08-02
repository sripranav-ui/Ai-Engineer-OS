import React, { useState } from "react";
import { Copy, RefreshCw, Square, Edit3, Check } from "lucide-react";

export function MessageActions({ content, isGenerating, onRegenerate, onStop, onEdit }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400">
      <button
        onClick={handleCopy}
        title="Copy text"
        className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {onRegenerate && !isGenerating && (
        <button
          onClick={onRegenerate}
          title="Regenerate response"
          className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}

      {isGenerating && onStop && (
        <button
          onClick={onStop}
          title="Stop generating"
          className="p-1 text-rose-400 hover:bg-rose-950/40 rounded transition-colors flex items-center gap-1"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span className="text-[10px]">Stop</span>
        </button>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          title="Edit prompt"
          className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default MessageActions;
