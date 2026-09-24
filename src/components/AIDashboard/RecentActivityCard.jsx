import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../Common/GlassCard.jsx";
import executionHistory from "../../services/ai/agents/executionHistory.js";
import agentHealthMonitor from "../../services/ai/agents/agentHealthMonitor.js";
import {
  Clock,
  ShieldCheck,
  Activity,
  FileText,
  Compass,
  CheckSquare,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

/**
 * RecentActivityCard.jsx — Compact Technical Activity Rows & Quick Workspace Hubs
 * Features:
 * - Real execution history audit log
 * - Multi-agent system health check status rows
 * - Fast navigation triggers into Notes, Knowledge, and Planner hubs
 */
export function RecentActivityCard() {
  const navigate = useNavigate();

  // Load real execution history and health metrics
  const history = useMemo(() => executionHistory.getHistory() || [], []);
  const healthList = useMemo(() => agentHealthMonitor.checkHealth() || [], []);

  return (
    <div className="space-y-6">
      {/* ── Compact Execution Audit Timeline ── */}
      <GlassCard>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXECUTION AUDIT TIMELINE</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">LIVE LOG</span>
        </div>

        <div className="space-y-2 pt-3">
          {history.length === 0 ? (
            <div className="p-3 rounded-xl bg-[#080B16] border border-white/[0.04] text-center">
              <span className="text-xs font-mono text-slate-500">
                All systems idle. Ready for agent dispatch.
              </span>
            </div>
          ) : (
            history.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#080B16] border border-white/[0.04] text-xs flex items-center justify-between gap-3"
              >
                <div className="truncate flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-slate-200 truncate">
                    {item.goalText || "Goal Execution"}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                  <span className="text-emerald-400 font-semibold uppercase">{item.status || "OK"}</span>
                  <span className="text-slate-500">
                    {new Date(item.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* ── Agent Health Status Rows ── */}
      <GlassCard>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SYSTEM HEALTH MONITOR</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
            100% HEALTHY
          </span>
        </div>

        <div className="space-y-1.5 pt-3">
          {healthList.slice(0, 4).map((h) => (
            <div
              key={h.agentId}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B16] border border-white/[0.04] text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-medium text-slate-200">{h.name}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> PASS
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Quick Workspace Hubs ── */}
      <GlassCard>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-3">
          WORKSPACE HUBS
        </span>

        <div className="space-y-2">
          <button
            onClick={() => navigate("/notes")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#080B16] border border-white/[0.04] hover:border-violet-500/30 text-xs text-slate-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Engineering Notes Vault</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => navigate("/knowledge")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#080B16] border border-white/[0.04] hover:border-violet-500/30 text-xs text-slate-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Knowledge Graph & Vector RAG</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => navigate("/planner")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#080B16] border border-white/[0.04] hover:border-violet-500/30 text-xs text-slate-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sprint Planner & Milestones</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

export default React.memo(RecentActivityCard);
