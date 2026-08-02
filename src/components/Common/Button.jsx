import React from "react";

// =======================================================
// Button.jsx — Enterprise UI Design System Component
// =======================================================

function Button({
  children,
  onClick,
  type = "primary", // primary | secondary | ghost | danger | outline
  size = "md", // sm | md | lg
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  className = "",
  style = {},
  ...props
}) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-xs gap-2",
    lg: "px-5 py-2 text-sm gap-2.5",
  }[size] || "px-3.5 py-1.5 text-xs gap-2";

  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm border border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/50",
    secondary: "bg-[#121218] hover:bg-[#181824] text-slate-200 font-medium border border-white/[0.08] focus:ring-2 focus:ring-indigo-500/50",
    ghost: "bg-transparent hover:bg-white/[0.06] text-slate-300 font-medium border border-transparent focus:ring-2 focus:ring-indigo-500/50",
    danger: "bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm border border-rose-500/40 focus:ring-2 focus:ring-rose-500/50",
    outline: "bg-transparent hover:bg-white/[0.04] text-slate-200 font-medium border border-white/[0.1] focus:ring-2 focus:ring-indigo-500/50",
  }[type] || "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-150 ease-out outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? "w-full" : ""
      } ${sizeClasses} ${variantClasses} ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default React.memo(Button);
