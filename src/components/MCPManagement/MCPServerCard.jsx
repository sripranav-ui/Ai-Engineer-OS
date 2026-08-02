import React from "react";
import { Server, Activity, Wrench, RefreshCw, Power, CheckCircle2, XCircle } from "lucide-react";

export function MCPServerCard({ server, onConnect, onDisconnect, onReconnect, onInspectTools }) {
  const isConnected = server.status === "CONNECTED";

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0F1320]/90 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-cyan-500/35 transition-all shadow-xl hover:shadow-2xl hover:shadow-cyan-500/5 group">
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-600/10 to-indigo-500/20 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shadow-inner">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors tracking-tight">{server.name}</h3>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Transport: {server.transport || "Stdio / HTTP"}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {isConnected ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400 font-mono font-medium">
                <XCircle className="w-3 h-3 text-slate-500" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300 my-4">
          <div className="p-2.5 rounded-xl bg-[#090C14] border border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-400">Latency Ping:</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              {server.latencyMs || 42}ms
            </span>
          </div>

          {/* Capabilities */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono font-medium mb-1.5">Capabilities</div>
            <div className="flex flex-wrap gap-1.5">
              {(server.capabilities || ["tools", "resources", "prompts"]).map((cap, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-mono font-semibold">
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <button
          onClick={() => onInspectTools(server)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Tools ({server.toolsCount || 4})</span>
        </button>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <button
                onClick={() => onReconnect(server.id)}
                className="p-1.5 rounded-lg bg-[#090C14] border border-white/10 hover:border-white/20 text-slate-300 transition-all"
                title="Reconnect"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDisconnect(server.id)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-all active:scale-95"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onConnect(server.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MCPServerCard;
