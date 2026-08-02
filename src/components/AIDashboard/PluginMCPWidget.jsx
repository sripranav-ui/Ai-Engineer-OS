import React from "react";
import { Package, Server } from "lucide-react";
import pluginManager from "../../services/plugins/pluginManager.js";
import mcpServerManager from "../../services/mcp/mcpServerManager.js";

export function PluginMCPWidget() {
  const plugins = pluginManager.getInstalledPlugins("default");
  const mcpServers = mcpServerManager.listServers();

  return (
    <div className="col-span-12 md:col-span-4 p-5 rounded-2xl bg-[#0E121E]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-emerald-500/30 hover:bg-[#121727]/95 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.1)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs tracking-tight">
          <Package className="w-4 h-4 text-emerald-400" />
          <span>Plugins & MCP Servers</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3.5 rounded-xl bg-[#080A10] border border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase font-medium">
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plugins</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1 font-mono">{plugins.length}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#080A10] border border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase font-medium">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>MCP Servers</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-100 mt-1 font-mono">{mcpServers.length}</div>
        </div>
      </div>
    </div>
  );
}

export default PluginMCPWidget;
