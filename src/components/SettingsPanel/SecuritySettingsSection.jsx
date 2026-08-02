import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { PERMISSION_SCOPES } from "../../services/ai/tools/runtime/permissionManager.js";

export function SecuritySettingsSection() {
  const scopes = Object.values(PERMISSION_SCOPES);

  return (
    <div className="settings-section-card space-y-4 text-xs">
      <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm border-b border-slate-800 pb-3">
        <ShieldCheck className="w-4 h-4" />
        <span>Security, Capability Scopes & RBAC</span>
      </div>

      <div>
        <div className="text-slate-300 font-medium mb-2">Granted System Permission Scopes</div>
        <div className="flex flex-wrap gap-1.5">
          {scopes.map((s, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SecuritySettingsSection;
