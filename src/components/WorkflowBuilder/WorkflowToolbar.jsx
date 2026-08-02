import React from "react";
import { Play, Pause, Save, CheckCircle2, Download, Upload, LayoutGrid, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export function WorkflowToolbar({
  onRun,
  onPause,
  onSave,
  onValidate,
  onExport,
  onImport,
  onOpenTemplates,
  onZoomIn,
  onZoomOut,
  onFitView,
  isRunning,
}) {
  return (
    <div className="h-12 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between text-xs z-10">
      {/* Run Controls */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Execute Workflow</span>
          </button>
        )}

        <button
          onClick={onValidate}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Validate</span>
        </button>

        <button
          onClick={onSave}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-indigo-400" />
          <span>Save</span>
        </button>
      </div>

      {/* Templates & Import/Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-colors font-medium"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Templates</span>
        </button>

        <button
          onClick={onExport}
          title="Export JSON"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onImport}
          title="Import JSON"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Zoom Controls */}
        <button onClick={onZoomIn} className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={onZoomOut} className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={onFitView} className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default WorkflowToolbar;
