import React from "react";

/**
 * SectionHeader.jsx — Structured Section Header for Visual Hierarchy
 * Features:
 * - Eyebrow/Overline with monospace badge feel
 * - Prominent typography with tight tracking
 * - Subtitle / description for context
 * - Action slot for buttons or status chips
 */
export function SectionHeader({
  overline,
  title,
  description,
  action,
  className = "",
  titleSize = "md", // "sm" | "md" | "lg"
}) {
  const titleClasses = {
    sm: "text-base font-bold text-white tracking-tight",
    md: "text-xl font-extrabold text-white tracking-tight",
    lg: "text-2xl md:text-3xl font-black text-white tracking-tight",
  }[titleSize] || "text-xl font-extrabold text-white tracking-tight";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 ${className}`}>
      <div className="space-y-1">
        {overline && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-violet-400">
              {overline}
            </span>
          </div>
        )}
        <h2 className={titleClasses}>{title}</h2>
        {description && (
          <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

export default React.memo(SectionHeader);
