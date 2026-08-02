import React from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { REUSABLE_TEMPLATES } from "../../services/ai/workflow/templates.js";

export function WorkflowTemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  if (!isOpen) return null;

  const templatesList = Object.values(REUSABLE_TEMPLATES);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-[600px] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Workflow Templates Gallery</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {templatesList.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">{tpl.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{tpl.description}</div>
                <div className="text-[10px] text-indigo-400/80 font-mono mt-2">{tpl.nodes.length} Nodes | {tpl.edges.length} Connections</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkflowTemplatesModal;
