import React from "react";
import { Database } from "lucide-react";

export function MemoryCard({ page = "Dashboard", project = "AI OS" }) {
  return (
    <div className="my-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs">
      <div className="flex items-center gap-2 text-emerald-300 font-medium">
        <Database className="w-3.5 h-3.5 text-emerald-400" />
        <span>Context Injected: {page} | Project: {project}</span>
      </div>
    </div>
  );
}

export default MemoryCard;
