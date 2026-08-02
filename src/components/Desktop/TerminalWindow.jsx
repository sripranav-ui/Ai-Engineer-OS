import React, { useState } from "react";
import { Terminal, Send, Trash2 } from "lucide-react";
import logger from "../../utils/logger.js";

export function TerminalWindow() {
  const [inputCmd, setInputCmd] = useState("");
  const [history, setHistory] = useState([
    { type: "sys", text: "AI Engineer OS Desktop Terminal v2.0" },
    { type: "sys", text: "Type 'help' for available CLI commands." },
  ]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;

    const cmd = inputCmd.trim();
    const entry = { type: "user", text: `$ ${cmd}` };
    const responseLogs = [];

    if (cmd === "help") {
      responseLogs.push({ type: "out", text: "Available commands: help, clear, status, workflows, agents, rag, mcp" });
    } else if (cmd === "status") {
      responseLogs.push({ type: "out", text: "System Status: ONLINE (HTTP 200 OK) | Memory: Healthy" });
    } else if (cmd === "clear") {
      setHistory([]);
      setInputCmd("");
      return;
    } else {
      responseLogs.push({ type: "out", text: `Executed CLI command: ${cmd}` });
    }

    setHistory((prev) => [...prev, entry, ...responseLogs]);
    setInputCmd("");
  };

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 flex flex-col font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Integrated OS CLI Terminal</h1>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Direct system process execution and telemetry shell</p>
          </div>
        </div>
        <button
          onClick={() => setHistory([])}
          className="p-2 rounded-xl bg-[#090C14] border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
          title="Clear Terminal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#090C14]/90 p-4 rounded-2xl border border-white/[0.07] space-y-2.5 desktop-scrollbar shadow-inner">
        {history.map((h, idx) => (
          <div
            key={idx}
            className={h.type === "user" ? "text-indigo-300 font-bold" : h.type === "sys" ? "text-emerald-400 font-semibold" : "text-slate-300 leading-relaxed"}
          >
            {h.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommandSubmit} className="mt-4 flex items-center gap-2.5">
        <span className="text-indigo-400 font-bold text-sm">$</span>
        <input
          type="text"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          placeholder="Type OS CLI command (e.g. help, status, clear)..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#090C14] border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs transition-all shadow-inner"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white transition-all shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default TerminalWindow;
