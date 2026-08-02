import React from "react";

export function TypingAnimation() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-800/60 border border-slate-700/50 w-fit">
      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export default TypingAnimation;
