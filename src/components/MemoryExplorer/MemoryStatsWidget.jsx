import React from "react";
import { Database, Pin, HardDrive, MessageSquare } from "lucide-react";

export function MemoryStatsWidget({ shortTermCount, longTermCount, pinnedCount, convCount }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Short-Term TTL</div>
          <div className="text-lg font-bold text-indigo-400 mt-0.5">{shortTermCount} Keys</div>
        </div>
        <HardDrive className="w-5 h-5 text-indigo-400/80" />
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Long-Term Storage</div>
          <div className="text-lg font-bold text-cyan-400 mt-0.5">{longTermCount} Items</div>
        </div>
        <Database className="w-5 h-5 text-cyan-400/80" />
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Pinned Memory</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{pinnedCount} Pinned</div>
        </div>
        <Pin className="w-5 h-5 text-emerald-400/80" />
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Chat Sessions</div>
          <div className="text-lg font-bold text-purple-400 mt-0.5">{convCount} Sessions</div>
        </div>
        <MessageSquare className="w-5 h-5 text-purple-400/80" />
      </div>
    </div>
  );
}

export default MemoryStatsWidget;
