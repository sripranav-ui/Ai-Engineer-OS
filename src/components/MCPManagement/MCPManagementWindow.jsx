import React, { useState } from "react";
import MCPServerCard from "./MCPServerCard.jsx";
import MCPToolInspectorModal from "./MCPToolInspectorModal.jsx";
import MCPServerConfigModal from "./MCPServerConfigModal.jsx";
import MCPLogsDrawer from "./MCPLogsDrawer.jsx";
import mcpServerManager from "../../services/mcp/mcpServerManager.js";
import { Server, Plus, Terminal, RefreshCw } from "lucide-react";
import "./mcpManagementStyles.css";

export function MCPManagementWindow() {
  const [servers, setServers] = useState(() => mcpServerManager.listServers());
  const [selectedServerForTools, setSelectedServerForTools] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const refreshList = () => {
    setServers(mcpServerManager.listServers());
  };

  const handleConnect = (serverId) => {
    mcpServerManager.connectServer(serverId);
    refreshList();
  };

  const handleDisconnect = (serverId) => {
    mcpServerManager.disconnectServer(serverId);
    refreshList();
  };

  const handleReconnect = (serverId) => {
    mcpServerManager.disconnectServer(serverId);
    mcpServerManager.connectServer(serverId);
    refreshList();
  };

  const handleAddServer = (serverSpec) => {
    mcpServerManager.registerServer(serverSpec);
    refreshList();
  };

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans relative desktop-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-600/10 to-indigo-500/20 border border-cyan-500/35 text-cyan-400 shadow-md shadow-cyan-500/10">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">MCP (Model Context Protocol) Manager</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage external tool servers, remote resources, and prompt templates</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect MCP Server</span>
          </button>
          <button
            onClick={() => setIsLogsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#090C14] text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Logs</span>
          </button>
        </div>
      </div>

      {/* Server List Grid */}
      <div className="mcp-grid">
        {servers.map((server) => (
          <MCPServerCard
            key={server.id}
            server={server}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onReconnect={handleReconnect}
            onInspectTools={setSelectedServerForTools}
          />
        ))}
      </div>

      {/* Modals & Drawers */}
      <MCPToolInspectorModal server={selectedServerForTools} isOpen={!!selectedServerForTools} onClose={() => setSelectedServerForTools(null)} />

      <MCPServerConfigModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddServer={handleAddServer} />

      <MCPLogsDrawer isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
    </div>
  );
}

export default MCPManagementWindow;
