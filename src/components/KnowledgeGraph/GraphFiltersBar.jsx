import React from "react";
import { FiSearch, FiZoomIn, FiZoomOut, FiMaximize2 } from "react-icons/fi";

export function GraphFiltersBar({
  searchQuery,
  onSearchChange,
  activeType,
  onTypeChange,
  onZoomIn,
  onZoomOut,
  onFitView,
}) {
  const entityTypes = ["All", "Project", "Task", "Note", "Workflow", "Agent", "Plugin", "Memory"];

  return (
    <div className="h-12 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between text-xs z-10">
      {/* Search */}
      <div className="relative w-64">
        <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Knowledge Graph entities..."
          className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Entity Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {entityTypes.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
              activeType === type ? "bg-indigo-600 text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button onClick={onZoomIn} className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white">
          <FiZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={onZoomOut} className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white">
          <FiZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={onFitView} className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white">
          <FiMaximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default GraphFiltersBar;
