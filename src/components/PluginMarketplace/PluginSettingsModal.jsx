import React, { useState } from "react";
import { X, Settings, Save } from "lucide-react";

export function PluginSettingsModal({ plugin, isOpen, onClose, onSaveSetting }) {
  const [settingsValues, setSettingsValues] = useState(() => {
    const map = {};
    if (plugin && plugin.settings) {
      plugin.settings.forEach((s) => (map[s.key] = s.value || ""));
    }
    return map;
  });

  if (!isOpen || !plugin) return null;

  const handleSave = (e) => {
    e.preventDefault();
    Object.entries(settingsValues).forEach(([key, val]) => {
      onSaveSetting(plugin.id, key, val);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSave} className="w-[450px] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Settings className="w-4 h-4" />
            <span>{plugin.name} — Settings</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {plugin.settings &&
            plugin.settings.map((s) => (
              <div key={s.key}>
                <label className="block text-xs font-medium text-slate-300 mb-1">{s.label || s.key}</label>
                <input
                  type={s.type || "text"}
                  value={settingsValues[s.key] || ""}
                  onChange={(e) => setSettingsValues({ ...settingsValues, [s.key]: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium">
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default PluginSettingsModal;
