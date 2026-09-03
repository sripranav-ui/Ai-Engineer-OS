import React, { useState, useEffect } from "react";
import { Activity, Server, Database, GitMerge, Bot, Eye } from "lucide-react";
import mcpServerManager from "../../services/mcp/mcpServerManager.js";
import shortTermMemory from "../../services/ai/memory/shortTermMemory.js";
import executionMonitor from "../../services/ai/agents/executionMonitor.js";
import RuntimeStatusBadge from "../Runtime/RuntimeStatusBadge.jsx";

export function BottomStatusBar({ onToggleInspector, isInspectorOpen }) {
  const [mcpCount, setMcpCount] = useState(0);
  const [activePage, setActivePage] = useState("Dashboard");
  const [agentMetrics, setAgentMetrics] = useState({ activeTasks: 0 });

  useEffect(() => {
    const updateStats = () => {
      setMcpCount(mcpServerManager.listServers().length);
      setActivePage(shortTermMemory.getMemory().activePage || "Dashboard");
      setAgentMetrics(executionMonitor.getMetrics());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 bg-[#09090b] border-t border-white/[0.06] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-20 shrink-0">
      {/* Left Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>OS Online</span>
        </div>

        <RuntimeStatusBadge />

        <div className="flex items-center gap-1.5 text-indigo-300">
          <Database className="w-3 h-3 text-indigo-400" />
          <span>Page: {activePage}</span>
        </div>

        <div className="flex items-center gap-1.5 text-cyan-300">
          <Bot className="w-3 h-3 text-cyan-400" />
          <span>Active Agents: {agentMetrics.activeTasks}</span>
        </div>
      </div>

      {/* Right Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Server className="w-3 h-3 text-cyan-400" />
          <span>MCP Servers: {mcpCount}</span>
        </div>

        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors ${
              isInspectorOpen
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
            title="Toggle Context Inspector"
          >
            <Eye className="w-3 h-3" />
            <span>Inspector</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default BottomStatusBar;
