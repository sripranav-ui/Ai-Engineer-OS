import React from "react";
import { Clock } from "lucide-react";

export function MemoryTimelineView({ items = [] }) {
  return (
    <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
      {items.map((item, idx) => (
        <div key={idx} className="relative group">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 absolute -left-[21px] top-1.5 border-2 border-slate-950" />
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span className="text-indigo-400">{item.layer || "Memory Event"}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.timestamp || Date.now()).toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-1 text-slate-200 font-medium">{item.title || item.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MemoryTimelineView;
