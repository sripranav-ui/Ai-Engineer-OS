import React from "react";
import { Map } from "lucide-react";

export function MiniMap({ nodes = [] }) {
  return (
    <div className="absolute bottom-4 right-4 w-40 h-28 rounded-xl border border-slate-800 bg-slate-950/90 shadow-2xl p-2 select-none pointer-events-none z-10">
      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mb-1">
        <Map className="w-3 h-3 text-indigo-400" />
        <span>Mini Map</span>
      </div>
      <div className="relative w-full h-20 bg-slate-900/80 rounded-lg overflow-hidden">
        {nodes.map((n) => (
          <div
            key={n.id}
            style={{
              left: `${Math.min(80, (n.x / 1000) * 80)}%`,
              top: `${Math.min(80, (n.y / 800) * 80)}%`,
            }}
            className="absolute w-2 h-2 rounded bg-indigo-500"
          />
        ))}
      </div>
    </div>
  );
}

export default MiniMap;
