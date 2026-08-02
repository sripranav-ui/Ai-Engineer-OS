import React from "react";
import { Sliders, X, Trash2 } from "lucide-react";

export function PropertiesPanel({ node, onClose, onChange, onDelete }) {
  if (!node) return null;

  return (
    <div className="w-72 bg-slate-950 border-l border-slate-800 p-4 flex flex-col h-full z-20">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
          <Sliders className="w-4 h-4" />
          <span>Properties: {node.label || node.type}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Node Label</label>
          <input
            type="text"
            value={node.label || ""}
            onChange={(e) => onChange({ ...node, label: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Node Type</label>
          <input
            type="text"
            disabled
            value={node.type}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Configuration (JSON)</label>
          <textarea
            rows={4}
            value={JSON.stringify(node.config || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ ...node, config: parsed });
              } catch (err) {}
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={() => onDelete(node.id)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600/30 text-xs font-medium transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete Node</span>
      </button>
    </div>
  );
}

export default PropertiesPanel;
