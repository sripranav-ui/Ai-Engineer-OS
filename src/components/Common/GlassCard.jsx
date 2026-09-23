import React from "react";

/**
 * GlassCard.jsx — Premium Obsidian Glassmorphism Surface
 * Adheres to AI Engineer OS Phase 1 visual foundation:
 * - Deep obsidian/navy translucent background
 * - Subtle hairline border (5-8% white)
 * - Top edge specular highlight
 * - Restrained violet/indigo ambient glow on hover
 * - Smooth radius hierarchy (rounded-2xl)
 */
export function GlassCard({
  children,
  title,
  subtitle,
  overline,
  action,
  glow = false,
  hoverable = false,
  className = "",
  onClick,
  style = {},
  ...props
}) {
  const isInteractive = hoverable || Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-[#0B0F19]/85 backdrop-blur-xl border border-white/[0.06] transition-all duration-200 overflow-hidden ${
        glow
          ? "shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(124,58,237,0.12),inset_0_1px_0_0_rgba(255,255,255,0.08)] border-violet-500/20"
          : "shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
      } ${
        isInteractive
          ? "cursor-pointer hover:border-violet-500/30 hover:bg-[#0E1424]/90 hover:shadow-[0_12px_36px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-0.5 active:translate-y-0"
          : ""
      } ${className}`}
      style={style}
      {...props}
    >
      {/* Subtle Corner Ambient Violet Sheen */}
      {glow && (
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"
        />
      )}

      {/* Header Slot if title or overline is present */}
      {(title || overline || action) && (
        <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4 border-b border-white/[0.04]">
          <div className="space-y-0.5">
            {overline && (
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-violet-400/90 block">
                {overline}
              </span>
            )}
            {title && (
              <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className={title || overline ? "p-6 pt-4" : "p-6"}>{children}</div>
    </div>
  );
}

export default React.memo(GlassCard);
