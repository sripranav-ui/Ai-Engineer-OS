import React from "react";
import AIChatWindow from "../components/AIChat/AIChatWindow.jsx";

// =======================================================
// AssistantPage.jsx — Redesigned Cursor/Claude Desktop AI Studio
// =======================================================

function AssistantPage() {
  return (
    <div className="h-full w-full bg-[#09090b] text-slate-100 font-sans overflow-hidden">
      <AIChatWindow />
    </div>
  );
}

export default React.memo(AssistantPage);
