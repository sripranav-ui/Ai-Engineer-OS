import React from "react";
import Button from "./Button";

// =======================================================
// EmptyState.jsx — Enterprise UI Component
// =======================================================

function EmptyState({
  icon = "📄",
  title = "No items found",
  description = "Get started by creating a new entry or adjusting your active filters.",
  actionText,
  onAction,
  secondaryText,
  onSecondary,
  suggestions = [],
  className = "",
  style = {},
}) {
  return (
    <div
      className={`p-8 rounded-xl bg-[#121218] border border-white/[0.08] text-center flex flex-col items-center justify-center my-4 ${className}`}
      style={style}
    >
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-4">
        {icon}
      </div>

      <h3 className="text-base font-bold text-white tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>

      {(actionText || secondaryText) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {actionText && onAction && (
            <Button onClick={onAction} type="primary">
              {actionText}
            </Button>
          )}
          {secondaryText && onSecondary && (
            <Button onClick={onSecondary} type="ghost">
              {secondaryText}
            </Button>
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/[0.06] w-full max-w-xs text-left">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Suggestions:
          </span>
          <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1 m-0">
            {suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default React.memo(EmptyState);
