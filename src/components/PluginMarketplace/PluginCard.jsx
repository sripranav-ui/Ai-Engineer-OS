import React from "react";
import { Download, Settings, ShieldCheck, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";

export function PluginCard({ plugin, isInstalled, isEnabled, onInstall, onToggle, onOpenDetails, onOpenSettings }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0F1320]/90 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/5 group">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner">
              {plugin.icon || "🧩"}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors tracking-tight">{plugin.name}</h3>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">v{plugin.version} • {plugin.author || "Core Team"}</div>
            </div>
          </div>

          {isInstalled && (
            <button onClick={() => onToggle(plugin.id)} title={isEnabled ? "Disable" : "Enable"} className="transition-transform active:scale-95">
              {isEnabled ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">{plugin.description}</p>
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <button
          onClick={() => onOpenDetails(plugin)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        {isInstalled ? (
          <div className="flex items-center gap-2.5">
            {plugin.settings && plugin.settings.length > 0 && (
              <button
                onClick={() => onOpenSettings(plugin)}
                className="p-1.5 rounded-lg bg-[#090C14] border border-white/10 hover:border-white/20 text-slate-300 transition-all"
                title="Plugin Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-400 font-mono font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Installed
            </span>
          </div>
        ) : (
          <button
            onClick={() => onInstall(plugin)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default PluginCard;
