import React from "react";
import { Database, Pin, Edit3, Trash2 } from "lucide-react";

export function MemoryLayerCard({ item, onPin, onUnpin, onEdit, onDelete }) {
  const isPinned = item.pinned;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono">
            {item.layer || "Long-Term"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => (isPinned ? onUnpin(item.id) : onPin(item))}
              title={isPinned ? "Unpin" : "Pin"}
              className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? "text-indigo-400 fill-current" : ""}`} />
            </button>
            {onEdit && (
              <button onClick={() => onEdit(item)} title="Edit" className="p-1 text-slate-400 hover:text-slate-200 transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(item.id)} title="Delete" className="p-1 text-slate-400 hover:text-rose-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-xs font-semibold text-slate-100 mb-1">{item.title || "Memory Entry"}</h3>
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{item.text || item.value || JSON.stringify(item)}</p>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-indigo-400" /> Key: {item.id || "mem"}
        </span>
        <span>{new Date(item.updatedAt || Date.now()).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default MemoryLayerCard;
