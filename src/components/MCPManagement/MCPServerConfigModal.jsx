import React, { useState } from "react";
import { Server, X, Plus } from "lucide-react";

export function MCPServerConfigModal({ isOpen, onClose, onAddServer }) {
  const [serverName, setServerName] = useState("");
  const [transportType, setTransportType] = useState("stdio");
  const [commandOrUrl, setCommandOrUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!serverName || !commandOrUrl) return;
    onAddServer({
      id: `mcp_srv_${Date.now()}`,
      name: serverName,
      transport: transportType,
      commandOrUrl,
      status: "CONNECTED",
      latencyMs: Math.floor(Math.random() * 30) + 15,
      capabilities: ["tools", "resources", "prompts"],
      toolsCount: 3,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-[450px] bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Server className="w-4 h-4" />
            <span>Connect New MCP Server</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Server Name</label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="e.g. GitHub MCP Server"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Transport Protocol</label>
            <select
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="stdio">Stdio Process Stream</option>
              <option value="sse">Server-Sent Events (SSE)</option>
              <option value="http">HTTP Endpoint</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Command or Endpoint URL</label>
            <input
              type="text"
              value={commandOrUrl}
              onChange={(e) => setCommandOrUrl(e.target.value)}
              placeholder="e.g. npx -y @modelcontextprotocol/server-github"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium">
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Server</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default MCPServerConfigModal;
