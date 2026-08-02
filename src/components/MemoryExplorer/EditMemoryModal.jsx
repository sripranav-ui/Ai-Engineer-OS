import React, { useState } from "react";
import { Edit3, X, Save } from "lucide-react";

export function EditMemoryModal({ item, isOpen, onClose, onSave }) {
  const [text, setText] = useState(item?.text || item?.value || "");

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...item, text });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-[450px] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Edit3 className="w-4 h-4" />
            <span>Edit Memory Entry — {item.id}</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-1">Memory Content</label>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium">
            <Save className="w-3.5 h-3.5" />
            <span>Save Memory</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditMemoryModal;
