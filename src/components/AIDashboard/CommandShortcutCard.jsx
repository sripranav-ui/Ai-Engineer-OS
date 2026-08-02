import React from "react";
import { Search, Zap } from "lucide-react";

export function CommandShortcutCard() {
  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
          <Search className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-100 tracking-tight">Command Palette</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Quick launcher & view navigation</div>
        </div>
      </div>

      <kbd className="px-2.5 py-1 rounded-lg bg-[#080A10] border border-white/10 text-[11px] font-mono text-indigo-300 shadow-sm font-semibold">
        ⌘K / Ctrl+K
      </kbd>
    </div>
  );
}

export default CommandShortcutCard;
