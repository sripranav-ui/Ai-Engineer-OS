import React, { useState } from "react";
import { Database, Save } from "lucide-react";
import longTermMemory from "../../services/ai/memory/longTermMemory.js";

export function MemorySettingsSection() {
  const [instructions, setInstructions] = useState(() => longTermMemory.getMemory().customInstructions || "");
  const [targetRole, setTargetRole] = useState(() => longTermMemory.getMemory().targetRole || "AI Software Engineer");

  const handleSave = (e) => {
    e.preventDefault();
    longTermMemory.setCustomInstructions(instructions);
    longTermMemory.setTargetRole(targetRole);
    alert("Memory settings & custom instructions updated.");
  };

  return (
    <form onSubmit={handleSave} className="settings-section-card space-y-4 text-xs">
      <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm border-b border-slate-800 pb-3">
        <Database className="w-4 h-4" />
        <span>Memory & Custom System Instructions</span>
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-1">Target Role Profile</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-1">Custom AI Instructions</label>
        <textarea
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. Always write production-grade JavaScript ES modules with JSDoc comments."
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
        <Save className="w-3.5 h-3.5" />
        <span>Save Memory Settings</span>
      </button>
    </form>
  );
}

export default MemorySettingsSection;
