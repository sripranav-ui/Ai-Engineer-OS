import React, { useState } from "react";
import { Search, Play, Square, Bot, Wrench, Shield, Database, Cpu, GitBranch, HelpCircle, Clock, Bell } from "lucide-react";

export const NODE_CATALOG = [
  { type: "start", label: "Start Node", category: "Triggers", icon: Play, color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/20" },
  { type: "end", label: "End Node", category: "Triggers", icon: Square, color: "text-rose-400 border-rose-500/40 bg-rose-950/20" },
  { type: "agent", label: "AI Agent", category: "Execution", icon: Bot, color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/20" },
  { type: "tool", label: "Tool Execution", category: "Execution", icon: Wrench, color: "text-amber-400 border-amber-500/40 bg-amber-950/20" },
  { type: "approval", label: "Human Approval", category: "Control", icon: Shield, color: "text-purple-400 border-purple-500/40 bg-purple-950/20" },
  { type: "memory", label: "Memory Access", category: "Storage", icon: Database, color: "text-indigo-400 border-indigo-500/40 bg-indigo-950/20" },
  { type: "llm", label: "LLM Completion", category: "Execution", icon: Cpu, color: "text-blue-400 border-blue-500/40 bg-blue-950/20" },
  { type: "subworkflow", label: "Sub-Workflow", category: "Control", icon: GitBranch, color: "text-teal-400 border-teal-500/40 bg-teal-950/20" },
  { type: "condition", label: "Conditional Branch", category: "Control", icon: HelpCircle, color: "text-yellow-400 border-yellow-500/40 bg-yellow-950/20" },
  { type: "delay", label: "Timer / Delay", category: "Control", icon: Clock, color: "text-orange-400 border-orange-500/40 bg-orange-950/20" },
  { type: "notification", label: "Notification", category: "Integrations", icon: Bell, color: "text-pink-400 border-pink-500/40 bg-pink-950/20" },
];

export function NodePalette({ onAddNode }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Triggers", "Execution", "Control", "Storage", "Integrations"];

  const filtered = NODE_CATALOG.filter(
    (n) =>
      (activeCategory === "All" || n.category === activeCategory) &&
      n.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 p-3 flex flex-col h-full shrink-0 select-none">
      <div className="text-xs font-semibold text-slate-300 mb-2">Node Palette</div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search node types..."
          className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              activeCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => onAddNode(item.type)}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform ${item.color}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div>
                <div className="text-xs font-medium">{item.label}</div>
                <div className="text-[10px] opacity-70">{item.category}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NodePalette;
