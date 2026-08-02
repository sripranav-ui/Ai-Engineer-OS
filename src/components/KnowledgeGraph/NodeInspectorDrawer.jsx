import React from "react";
import { FiEye, FiX, FiGitCommit } from "react-icons/fi";

export function NodeInspectorDrawer({ node, isOpen, onClose }) {
  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 p-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
          <FiEye className="w-4 h-4" />
          <span>Entity Inspector</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 text-xs text-slate-300 flex-1 overflow-y-auto">
        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase">Title</div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">{node.title}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Type:</span> <span className="text-indigo-300">{node.type}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400">ID:</span> <span className="text-indigo-300">{node.id}</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Metadata</div>
          <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
            {JSON.stringify(node.metadata || {}, null, 2)}
          </pre>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1 mb-1">
            <FiGitCommit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Connected Edges</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300">
            {node.edgesCount || 2} Connected Relationships
          </div>
        </div>
      </div>
    </div>
  );
}

export default NodeInspectorDrawer;
