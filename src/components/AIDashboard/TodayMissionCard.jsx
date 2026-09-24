import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../Common/GlassCard.jsx";
import StatusBadge from "../Common/StatusBadge.jsx";
import ProgressBar from "../Common/ProgressBar.jsx";
import LiquidMetalButton from "../ui/LiquidMetalButton.jsx";
import { Sparkles, CheckCircle2, Clock, BookOpen } from "lucide-react";

/**
 * TodayMissionCard.jsx — Primary Daily Engineering Objective
 * Features:
 * - Prominent GlassCard with subtle ambient glow
 * - Real curriculum roadmap tasks from AppContext
 * - Real checkDay task completion toggle
 * - Primary LiquidMetalButton executing navigate('/learning')
 * - Visual sprint progress tracking
 */
export function TodayMissionCard({ roadmap = [], todayLesson, onCheckDay }) {
  const navigate = useNavigate();

  // Calculate task completion progress from real roadmap
  const { completedCount, totalTasks, progressPercent } = useMemo(() => {
    const subset = roadmap.slice(0, 3);
    const total = subset.length || 3;
    const completed = subset.filter((t) => t.completed).length;
    const percent = Math.round((completed / total) * 100);
    return { completedCount: completed, totalTasks: total, progressPercent: percent };
  }, [roadmap]);

  return (
    <GlassCard glow={true}>
      {/* ── Mission Card Header with Liquid Metal CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
              TODAY'S MISSION OBJECTIVE
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-emerald-400">
              {completedCount}/{totalTasks} TASKS COMPLETE
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Day {todayLesson?.id}: {todayLesson?.topic}
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>Recommended focus session: 45 minutes</span>
          </div>
        </div>

        {/* Primary Interactive Component: LiquidMetalButton */}
        <div className="shrink-0">
          <LiquidMetalButton
            onClick={() => navigate("/learning")}
            icon={Sparkles}
            iconPosition="left"
            size="md"
            ariaLabel="Continue Mission"
          >
            Continue Mission
          </LiquidMetalButton>
        </div>
      </div>

      {/* ── Sprint Progress Bar ── */}
      <div className="py-4 space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>Daily Sprint Progress</span>
          <span className="text-white font-semibold">{progressPercent}%</span>
        </div>
        <ProgressBar progress={progressPercent} height="10px" variant="primary" />
      </div>

      {/* ── Inspirational Philosophy Banner ── */}
      <div className="py-2.5 px-4 mb-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-200 flex items-center gap-2.5">
        <span className="text-sm">💬</span>
        <em className="font-sans">
          "The only way to write fast code is to write clean code first."
        </em>
      </div>

      {/* ── Interactive Tasks Checklist ── */}
      <div className="space-y-2.5 pt-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
          Today's Action Items
        </span>
        <div className="space-y-2">
          {roadmap.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onCheckDay?.(item.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                item.completed
                  ? "bg-emerald-950/20 border-emerald-500/25 text-slate-300"
                  : "bg-[#090C16] border-white/[0.06] hover:border-violet-500/30 text-slate-200 hover:bg-[#0c101c]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(item.completed)}
                  onChange={() => {}} // handled by parent div onClick
                  className="w-4 h-4 rounded border-white/20 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span
                  className={`text-xs font-medium ${
                    item.completed ? "line-through text-slate-400" : "text-slate-200"
                  }`}
                >
                  Complete Day {item.id}: {item.topic}
                </span>
              </div>

              {item.completed ? (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> DONE
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">PENDING</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export default React.memo(TodayMissionCard);
