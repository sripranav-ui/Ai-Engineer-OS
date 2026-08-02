import React from "react";
import { X, Wrench, Code } from "lucide-react";

export function MCPToolInspectorModal({ server, isOpen, onClose }) {
  if (!isOpen || !server) return null;

  const mockTools = [
    { name: "github_list_issues", description: "List repository issues from GitHub MCP server.", parameters: { repo: "string", state: "open|closed" } },
    { name: "github_create_pull_request", description: "Create pull request on repository.", parameters: { title: "string", body: "string", head: "string" } },
    { name: "notion_query_database", description: "Query database records from Notion MCP server.", parameters: { databaseId: "string" } },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-[550px] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Wrench className="w-4 h-4" />
            <span>MCP Tool Inspector — {server.name}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {mockTools.map((tool, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
              <div className="flex items-center justify-between font-mono font-medium text-cyan-300">
                <span>{tool.name}</span>
                <span className="text-[10px] text-slate-500">MCP Tool</span>
              </div>
              <p className="mt-1 text-slate-300 leading-relaxed">{tool.description}</p>

              <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Code className="w-3 h-3 text-cyan-400" />
                <span>Input Schema:</span>
              </div>
              <pre className="mt-1 p-2 rounded bg-slate-950 text-[10px] font-mono text-slate-300 border border-slate-800">
                {JSON.stringify(tool.parameters, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MCPToolInspectorModal;
