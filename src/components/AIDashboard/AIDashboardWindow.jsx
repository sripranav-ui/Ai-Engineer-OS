import React from "react";
import AIChatWindow from "../AIChat/AIChatWindow.jsx";

// =======================================================
// AIDashboardWindow.jsx — Dashboard Concept Completely Deleted
// Directly renders AI Assistant Home Workspace
// =======================================================

export function AIDashboardWindow() {
  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 font-sans overflow-hidden">
      <AIChatWindow />
    </div>
  );
}

export default AIDashboardWindow;
