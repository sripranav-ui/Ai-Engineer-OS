import React from "react";
import { Database, HardDrive, Pin } from "lucide-react";
import shortTermMemory from "../../services/ai/memory/shortTermMemory.js";
import longTermMemory from "../../services/ai/memory/longTermMemory.js";

export function MemoryUsageWidget() {
  const st = shortTermMemory.getMemory();
  const lt = longTermMemory.getMemory();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-tight">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>AI Memory Engine Telemetry</span>
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-3 rounded-xl bg-[#080A10] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-200 font-medium">Active View</span>
          </div>
          <span className="font-mono text-indigo-300 font-semibold uppercase text-[11px]">{st.activePage || "Dashboard"}</span>
        </div>

        <div className="p-3 rounded-xl bg-[#080A10] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Pin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-200 font-medium">Pinned Memory</span>
          </div>
          <span className="font-mono text-emerald-300 font-semibold text-[11px]">{lt.pinnedNotes?.length || 0} Pinned</span>
        </div>
      </div>
    </div>
  );
}

export default MemoryUsageWidget;
