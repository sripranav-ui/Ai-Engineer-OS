import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export function MarkdownRenderer({ content = "" }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(idx);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Simple regex codeblock extraction for lightweight zero-dependency rendering
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="markdown-content text-sm space-y-3 leading-relaxed text-slate-200">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "text";
          const codeText = language === lines[0] ? lines.slice(1).join("\n") : lines.join("\n");

          return (
            <div key={idx} className="relative group my-3 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900/90 shadow-lg">
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-xs text-slate-400 font-mono">
                <span>{language}</span>
                <button
                  onClick={() => handleCopy(codeText, idx)}
                  className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                >
                  {copiedCode === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === idx ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto text-indigo-200/90">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        return (
          <p key={idx} className="whitespace-pre-wrap">
            {part}
          </p>
        );
      })}
    </div>
  );
}

export default MarkdownRenderer;
