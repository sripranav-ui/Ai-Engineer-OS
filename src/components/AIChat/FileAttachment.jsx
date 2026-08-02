import React from "react";
import { FileText, X } from "lucide-react";

export function FileAttachment({ files = [], onRemove }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {files.map((file, idx) => (
        <div key={idx} className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-200">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate max-w-[120px]">{file.name}</span>
          {onRemove && (
            <button onClick={() => onRemove(idx)} className="hover:text-rose-400">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default FileAttachment;
