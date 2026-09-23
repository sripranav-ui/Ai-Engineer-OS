import React from "react";

/**
 * IconButton.jsx — Accessible Icon Trigger Button
 * Features:
 * - Proper button semantics & aria-label
 * - Obsidian glassmorphic surface
 * - Subtle hover acceleration & ring highlight
 * - Sizes: sm (w-8 h-8), md (w-9 h-9), lg (w-10 h-10)
 */
export function IconButton({
  icon: Icon,
  children,
  onClick,
  label,
  title,
  size = "md", // "sm" | "md" | "lg"
  variant = "surface", // "surface" | "ghost" | "glow" | "danger"
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs rounded-xl",
    md: "w-9 h-9 text-sm rounded-xl",
    lg: "w-11 h-11 text-base rounded-2xl",
  }[size] || "w-9 h-9 text-sm rounded-xl";

  const variantClasses = {
    surface:
      "bg-[#0E121E]/80 hover:bg-[#141A2B] text-slate-300 hover:text-white border border-white/[0.08] hover:border-violet-500/30 shadow-sm",
    ghost:
      "bg-transparent hover:bg-white/[0.06] text-slate-400 hover:text-white border border-transparent",
    glow:
      "bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 hover:text-white border border-violet-500/30 hover:shadow-[0_0_16px_rgba(139,92,246,0.3)]",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 border border-rose-500/30",
  }[variant] || "bg-[#0E121E]/80 text-slate-300 border border-white/[0.08]";

  const accessibleLabel = label || title || "Action button";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={accessibleLabel}
      title={title || label}
      className={`inline-flex items-center justify-center select-none outline-none transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {Icon ? <Icon className="w-4 h-4 shrink-0" /> : children}
    </button>
  );
}

export default React.memo(IconButton);
