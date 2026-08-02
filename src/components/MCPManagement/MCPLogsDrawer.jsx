import React from "react";
import { Terminal, X } from "lucide-react";

export function MCPLogsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 p-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs">
          <Terminal className="w-4 h-4" />
          <span>MCP Protocol Logs</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
        <div>[MCPClient] Initializing Model Context Protocol Client...</div>
        <div>[MCPServerManager] Discovered 2 active MCP server definitions.</div>
        <div>[MCPServerManager] Stdio transport connection established.</div>
      </div>
    </div>
  );
}

export default MCPLogsDrawer;
