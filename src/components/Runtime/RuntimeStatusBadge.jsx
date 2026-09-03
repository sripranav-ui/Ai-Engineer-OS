import React, { useState, useEffect } from "react";
import { Cpu, CheckCircle2, AlertCircle, X, Shield, Terminal, Clock, RefreshCw } from "lucide-react";
import runtimeClient from "../../services/runtime/runtimeClient.js";
import runtimeCapabilities from "../../services/runtime/runtimeCapabilities.js";

/**
 * RuntimeStatusBadge Component (V1.3)
 * Displays subtle connection indicator (● Local Runtime Connected / ○ Browser Mode)
 * and expandable status modal with workspace details, capability flags, and audit logs.
 */
export function RuntimeStatusBadge() {
  const [status, setStatus] = useState(runtimeClient.getStatus());
  const [showModal, setShowModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const update = () => {
      setStatus(runtimeClient.getStatus());
      setAuditLogs(runtimeClient.getAuditLogs());
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleConnection = () => {
    runtimeClient.toggleConnection(!status.connected);
    setStatus(runtimeClient.getStatus());
    setAuditLogs(runtimeClient.getAuditLogs());
  };

  const caps = status.capabilities?.capabilities || {};

  return (
    <>
      {/* Unobtrusive Status Badge Trigger */}
      <button
        onClick={() => setShowModal(true)}
        className={`px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 transition-all border shadow-sm ${
          status.connected
            ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60"
            : "bg-slate-900/60 border-slate-700/40 text-slate-400 hover:bg-slate-800/60"
        }`}
        title="Local Agent Runtime Gateway Status (Click to view capabilities)"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${status.connected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
        <span>{status.connected ? "Local Runtime Connected" : "Browser Mode"}</span>
      </button>

      {/* Expandable Status & Capability Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#09090D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#0E0E14]">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">V1.4 Native Local Runtime Daemon (http://127.0.0.1:7070)</span>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Connection Status Box */}
              <div className="p-4 rounded-xl bg-[#050508] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status.connected ? "bg-emerald-400" : "bg-slate-500"}`} />
                    <span className="font-semibold text-white">
                      Status: {status.connected ? "LOCAL RUNTIME CONNECTED ✓" : "BROWSER MODE (OFFLINE)"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Workspace: {status.capabilities?.workspacePath}
                  </div>
                </div>
                <button
                  onClick={toggleConnection}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all ${
                    status.connected
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{status.connected ? "Simulate Offline" : "Connect Runtime"}</span>
                </button>
              </div>

              {/* Capability Matrix */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400">Available Gateway Capabilities</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "Filesystem", enabled: caps.filesystem },
                    { name: "Terminal", enabled: caps.terminal },
                    { name: "Git Operations", enabled: caps.git },
                    { name: "Node.js Engine", enabled: caps.node },
                    { name: "NPM Package", enabled: caps.npm },
                    { name: "Test Suite", enabled: caps.tests },
                    { name: "Build Runner", enabled: caps.build },
                    { name: "Workspace Guard", enabled: true },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-center font-mono text-[10px] flex items-center justify-center gap-1.5 ${
                        c.enabled && status.connected
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gateway Audit Log Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Tool Gateway Audit Log ({auditLogs.length} entries)</span>
                  {auditLogs.length > 0 && (
                    <button onClick={() => runtimeClient.clearAuditLogs()} className="hover:text-rose-400">
                      Clear Logs
                    </button>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-[#050508] border border-white/[0.06] max-h-48 overflow-y-auto space-y-1.5 font-mono text-[10px]">
                  {auditLogs.length === 0 ? (
                    <div className="text-slate-500 text-center py-3">No gateway tool calls recorded.</div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-2 rounded-lg bg-[#0E0E14] border border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-indigo-400">[{log.tool}]</span>
                          <span className="text-slate-300 truncate max-w-xs">{log.output}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${log.status === "SUCCESS" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"}`}>
                            {log.status}
                          </span>
                          <span className="text-slate-500">{log.durationMs}ms</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RuntimeStatusBadge;
