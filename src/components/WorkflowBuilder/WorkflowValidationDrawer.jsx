import React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export function WorkflowValidationDrawer({ isOpen, onClose, validationResult }) {
  if (!isOpen) return null;

  const isValid = validationResult?.valid;
  const errors = validationResult?.errors || [];

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 p-4 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2 font-medium text-xs text-slate-200">
          {isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <span>Workflow Graph Validation</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {isValid ? (
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs">
            Graph structure is valid. No duplicate node IDs or cyclic dependencies detected.
          </div>
        ) : (
          errors.map((err, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {err}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WorkflowValidationDrawer;
