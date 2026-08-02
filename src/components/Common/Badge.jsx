import React from "react";

// =======================================================
// Badge.jsx — Enterprise UI Design System Component
// =======================================================

function Badge({ children, type = "primary", style = {}, className = "" }) {
  const variantStyles = {
    primary: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25",
    secondary: "bg-[#181822] text-slate-300 border-white/10",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    info: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
  }[type] || "bg-indigo-500/10 text-indigo-300 border-indigo-500/25";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border select-none ${variantStyles} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export default React.memo(Badge);
