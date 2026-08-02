import React from "react";

// =======================================================
// StatCard.jsx — Enterprise UI Design System Component
// =======================================================

function StatCard({ icon, title, value, color = "#6366f1", subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl bg-[#121218] border border-white/[0.08] flex flex-col justify-between transition-all duration-150 ease-out ${
        onClick ? "cursor-pointer hover:bg-[#181824] hover:border-white/[0.12] hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>{title}</span>
        {icon && <span className="text-sm shrink-0">{icon}</span>}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-mono tracking-tight" style={{ color: color || "#ffffff" }}>
          {value}
        </div>
        {subtitle && <div className="text-[11px] text-slate-400 font-mono mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

export default React.memo(StatCard);
