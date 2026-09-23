import React from "react";

/**
 * StatusBadge.jsx — High-End Monospace Status Pill
 * Features:
 * - Animated ping/pulse indicator dot
 * - Obsidian translucent background with subtle border
 * - Semantic variants: active, online, success, warning, danger, info, neutral
 */
export function StatusBadge({
  children,
  status = "active", // "active" | "online" | "success" | "warning" | "danger" | "info" | "neutral"
  pulse = true,
  className = "",
  size = "sm", // "sm" | "md"
}) {
  const statusConfig = {
    active: {
      dot: "bg-emerald-400",
      ping: "bg-emerald-400",
      bg: "bg-emerald-950/40 text-emerald-300 border-emerald-500/20",
    },
    online: {
      dot: "bg-emerald-400",
      ping: "bg-emerald-400",
      bg: "bg-emerald-950/40 text-emerald-300 border-emerald-500/20",
    },
    success: {
      dot: "bg-emerald-400",
      ping: "bg-emerald-400",
      bg: "bg-emerald-950/40 text-emerald-300 border-emerald-500/20",
    },
    warning: {
      dot: "bg-amber-400",
      ping: "bg-amber-400",
      bg: "bg-amber-950/40 text-amber-300 border-amber-500/20",
    },
    danger: {
      dot: "bg-rose-400",
      ping: "bg-rose-400",
      bg: "bg-rose-950/40 text-rose-300 border-rose-500/20",
    },
    info: {
      dot: "bg-violet-400",
      ping: "bg-violet-400",
      bg: "bg-violet-950/40 text-violet-300 border-violet-500/20",
    },
    neutral: {
      dot: "bg-slate-400",
      ping: "bg-slate-400",
      bg: "bg-white/[0.04] text-slate-300 border-white/10",
    },
  }[status] || {
    dot: "bg-violet-400",
    ping: "bg-violet-400",
    bg: "bg-violet-950/40 text-violet-300 border-violet-500/20",
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[10px] gap-1.5",
    md: "px-3 py-1 text-xs gap-2",
  }[size] || "px-2.5 py-0.5 text-[10px] gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium tracking-wider uppercase border backdrop-blur-md select-none ${statusConfig.bg} ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.ping}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot}`}
        />
      </span>
      <span>{children}</span>
    </span>
  );
}

export default React.memo(StatusBadge);
