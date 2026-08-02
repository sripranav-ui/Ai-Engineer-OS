import React from "react";
import { Bot, CheckCircle } from "lucide-react";

export function AgentExecutionCard({ agentName = "ResearchAgent", role = "researcher", subtasksCount = 3 }) {
  return (
    <div className="my-2 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-300 font-medium">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Delegated Agent: {agentName} ({role})</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-cyan-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Subtasks: {subtasksCount}</span>
        </div>
      </div>
    </div>
  );
}

export default AgentExecutionCard;
