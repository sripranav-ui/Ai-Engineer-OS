import React from "react";

// =======================================================
// Card.jsx — Enterprise UI Design System Component
// =======================================================

function Card({ children, title, subtitle, className = "", onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl bg-[#121218] border border-white/[0.08] transition-all duration-150 ease-out ${
        onClick ? "cursor-pointer hover:bg-[#181824] hover:border-white/[0.12] hover:-translate-y-0.5 shadow-sm" : ""
      } ${className}`}
      style={style}
    >
      {title && (
        <div className="border-b border-white/[0.06] pb-3 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight m-0">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-normal m-0">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default React.memo(Card);