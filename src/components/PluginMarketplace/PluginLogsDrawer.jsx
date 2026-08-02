import React from "react";
import { Terminal, X } from "lucide-react";

export function PluginLogsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 p-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
          <Terminal className="w-4 h-4" />
          <span>Plugin Execution Logs</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
        <div>[System] Plugin Manager initialized.</div>
        <div>[PluginManager] Checked active workspace plugins.</div>
        <div>[PluginRegistry] Registered core extension capabilities.</div>
      </div>
    </div>
  );
}

export default PluginLogsDrawer;
