import React from "react";
import { FiFolder, FiCheckSquare, FiFileText, FiGitBranch, FiCpu, FiPackage, FiDatabase } from "react-icons/fi";

const ICON_MAP = {
  Project: FiFolder,
  Task: FiCheckSquare,
  Note: FiFileText,
  Workflow: FiGitBranch,
  Agent: FiCpu,
  Plugin: FiPackage,
  Memory: FiDatabase,
};

export function GraphCanvas({ nodes = [], edges = [], selectedNodeId, onSelectNode, zoomLevel = 1 }) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex-1 h-full relative overflow-hidden bg-slate-950 graph-grid-bg cursor-grab active:cursor-grabbing">
      <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }} className="w-full h-full relative">
        {/* SVG Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {edges.map((e, idx) => {
            const src = nodeMap.get(e.source);
            const tgt = nodeMap.get(e.target);
            if (!src || !tgt) return null;
            return <line key={idx} x1={src.x + 40} y1={src.y + 40} x2={tgt.x + 40} y2={tgt.y + 40} stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.5" />;
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((n) => {
          const Icon = ICON_MAP[n.type] || FiFolder;
          const isSelected = n.id === selectedNodeId;

          return (
            <div
              key={n.id}
              onClick={() => onSelectNode(n.id)}
              style={{ transform: `translate(${n.x}px, ${n.y}px)` }}
              className={`absolute p-3 rounded-2xl border bg-slate-900/95 shadow-xl cursor-pointer select-none transition-all flex items-center gap-2.5 ${
                isSelected ? "ring-2 ring-indigo-500 border-indigo-400 bg-indigo-950/40" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-100">{n.title}</div>
                <div className="text-[10px] text-slate-400 font-mono">{n.type}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GraphCanvas;
