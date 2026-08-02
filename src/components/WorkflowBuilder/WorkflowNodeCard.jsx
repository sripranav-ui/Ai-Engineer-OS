import React from "react";
import { Play, Square, Bot, Wrench, Shield, Database, Cpu, GitBranch, HelpCircle, Clock, Bell, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const ICON_MAP = {
  start: Play,
  end: Square,
  agent: Bot,
  tool: Wrench,
  approval: Shield,
  memory: Database,
  llm: Cpu,
  subworkflow: GitBranch,
  condition: HelpCircle,
  delay: Clock,
  notification: Bell,
};

export function WorkflowNodeCard({ node, isSelected, onClick, onConnectStart, status }) {
  const Icon = ICON_MAP[node.type] || Bot;
  const isExecuting = status === "RUNNING";
  const isCompleted = status === "COMPLETED";

  return (
    <div
      onClick={onClick}
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
      className={`absolute w-48 rounded-xl border p-3 bg-slate-900/95 shadow-xl cursor-pointer select-none transition-all ${
        isSelected ? "ring-2 ring-indigo-500 border-indigo-400" : "border-slate-800 hover:border-slate-700"
      } ${isExecuting ? "ring-2 ring-amber-400 animate-pulse" : ""}`}
    >
      {/* Input Handle Port */}
      <div
        onMouseUp={() => onConnectStart(node.id, "target")}
        className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-950 absolute -left-1.5 top-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-crosshair"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200 truncate max-w-[100px]">{node.label || node.type}</span>
        </div>

        {/* Status Indicator */}
        <div>
          {isExecuting && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </div>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 font-mono">ID: {node.id}</div>

      {/* Output Handle Port */}
      <div
        onMouseDown={() => onConnectStart(node.id, "source")}
        className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-950 absolute -right-1.5 top-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-crosshair"
      />
    </div>
  );
}

export default WorkflowNodeCard;
