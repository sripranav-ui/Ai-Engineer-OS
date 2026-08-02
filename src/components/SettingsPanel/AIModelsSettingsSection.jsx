import React from "react";
import { Cpu, CheckCircle2 } from "lucide-react";
import modelRegistry from "../../services/ai/orchestration/registry/modelRegistry.js";

export function AIModelsSettingsSection() {
  const catalog = modelRegistry.getCatalog();

  return (
    <div className="space-y-4">
      <div className="settings-section-card">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-3">
          <Cpu className="w-4 h-4" />
          <span>Multi-LLM Catalog & Provider Routing</span>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Configure preferred completion providers, fallback strategies, and smart task router parameters.
        </p>

        <div className="space-y-2">
          {catalog.map((m) => (
            <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-medium text-slate-200">{m.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Provider: {m.provider} • Context: {m.contextWindow}</div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIModelsSettingsSection;
