import React from "react";

export function ConnectionLines({ edges = [], nodes = [] }) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {edges.map((edge, idx) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return null;

        const x1 = (source.x || 100) + 180;
        const y1 = (source.y || 100) + 35;
        const x2 = target.x || 100;
        const y2 = (target.y || 100) + 35;

        const dx = Math.abs(x2 - x1) * 0.5;
        const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        return (
          <g key={idx}>
            <path d={pathData} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray={edge.active ? "6,6" : "none"} className={edge.active ? "animate-pulse" : ""} />
            <circle cx={x2} cy={y2} r="4" fill="#6366f1" />
          </g>
        );
      })}
    </svg>
  );
}

export default ConnectionLines;
