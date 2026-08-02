import React from "react";
import { Search } from "lucide-react";

export function ConversationSearch({ value = "", onChange }) {
  return (
    <div className="relative mb-3">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search conversations..."
        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

export default ConversationSearch;
