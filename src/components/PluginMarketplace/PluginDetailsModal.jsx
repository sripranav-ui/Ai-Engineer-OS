import React from "react";
import { X, ShieldCheck, GitBranch } from "lucide-react";

export function PluginDetailsModal({ plugin, isOpen, onClose }) {
  if (!isOpen || !plugin) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-[500px] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <span className="text-lg">{plugin.icon || "🧩"}</span>
            <span>{plugin.name} — Details</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Description</div>
            <p className="mt-1 leading-relaxed text-slate-200">{plugin.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Version:</span> <span className="text-indigo-300">v{plugin.version}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Author:</span> <span className="text-indigo-300">{plugin.author || "Core Team"}</span>
            </div>
          </div>

          {/* Permissions Required */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Granted Permissions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {plugin.permissions && plugin.permissions.length > 0 ? (
                plugin.permissions.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No permissions requested.</span>
              )}
            </div>
          </div>

          {/* Dependency Graph */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1 mb-1">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Supported App Version</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-indigo-300">
              {plugin.supportedAppVersion || "^1.0.0"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PluginDetailsModal;
