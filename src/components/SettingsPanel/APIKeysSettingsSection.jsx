import React, { useState } from "react";
import { Key, Save } from "lucide-react";
import storageService from "../../services/storageService.js";

export function APIKeysSettingsSection() {
  const [openaiKey, setOpenaiKey] = useState(() => storageService.get("config_openai_key") || "");
  const [claudeKey, setClaudeKey] = useState(() => storageService.get("config_claude_key") || "");
  const [groqKey, setGroqKey] = useState(() => storageService.get("config_groq_key") || "");

  const handleSave = (e) => {
    e.preventDefault();
    storageService.set("config_openai_key", openaiKey);
    storageService.set("config_claude_key", claudeKey);
    storageService.set("config_groq_key", groqKey);
    alert("API Keys saved securely to local storage.");
  };

  return (
    <form onSubmit={handleSave} className="settings-section-card space-y-4 text-xs">
      <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm border-b border-slate-800 pb-3">
        <Key className="w-4 h-4" />
        <span>Provider API Credentials</span>
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-1">OpenAI API Key</label>
        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/60 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-1">Anthropic Claude API Key</label>
        <input
          type="password"
          value={claudeKey}
          onChange={(e) => setClaudeKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/60 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-1">Groq API Key</label>
        <input
          type="password"
          value={groqKey}
          onChange={(e) => setGroqKey(e.target.value)}
          placeholder="gsk_..."
          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/60 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
        <Save className="w-3.5 h-3.5" />
        <span>Save Credentials</span>
      </button>
    </form>
  );
}

export default APIKeysSettingsSection;
