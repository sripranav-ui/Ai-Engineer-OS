import React from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../Common/GlassCard.jsx";
import StatusBadge from "../Common/StatusBadge.jsx";
import ProgressBar from "../Common/ProgressBar.jsx";
import Button from "../Common/Button.jsx";
import { Rocket, GitBranch, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

/**
 * ActiveProjectCard.jsx — Engineering Workspace & Project Repository State
 * Features:
 * - Active project tracking from AppContext
 * - Milestone progression and sprint checklist
 * - Fast navigation into Projects Vault (/projects)
 * - Integrated Curriculum Pipeline recommendations linking to Learning Hub (/learning)
 */
export function ActiveProjectCard({ activeProject }) {
  const navigate = useNavigate();

  const title = activeProject?.title || "AI Engineer OS Core Platform";
  const isCompleted = Boolean(activeProject?.completed);

  return (
    <div className="space-y-6">
      {/* ── Active Project Repository Node ── */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block mb-1">
              ACTIVE ENGINEERING REPOSITORY
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          </div>

          <StatusBadge status={isCompleted ? "success" : "warning"} pulse={!isCompleted}>
            {isCompleted ? "Completed" : "In Progress"}
          </StatusBadge>
        </div>

        <div className="space-y-4 pt-4">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>Sprint Milestone Progress</span>
              <span className="text-white font-semibold">{isCompleted ? "100%" : "45%"}</span>
            </div>
            <ProgressBar progress={isCompleted ? 100 : 45} height="10px" variant="primary" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Active Sprint Deliverables
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-[#070A14] border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Phase 1 Visual Foundation & Liquid Metal Button</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">PASSED</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#070A14] border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>Phase 2 Command Center & AI Centerpiece Architecture</span>
                </div>
                <span className="text-[10px] font-mono text-violet-400">IN PROGRESS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
            <Button
              onClick={() => navigate("/projects")}
              type="primary"
              size="sm"
              icon={<Rocket className="w-3.5 h-3.5" />}
            >
              Open Kanban Board
            </Button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button
                type="outline"
                size="sm"
                icon={<GitBranch className="w-3.5 h-3.5" />}
              >
                Repository
              </Button>
            </a>
          </div>
        </div>
      </GlassCard>

      {/* ── Curriculum Progression Pipeline ── */}
      <GlassCard>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
            CURRICULUM PROGRESSION PIPELINE
          </span>
          <button
            onClick={() => navigate("/learning")}
            className="text-[11px] font-mono text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080B16] border border-violet-500/25 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-violet-400 font-semibold block">
                Resume Last Lesson
              </span>
              <h4 className="text-xs font-bold text-white leading-snug">
                Day 4: Python Dictionary Methods
              </h4>
            </div>
            <button
              onClick={() => navigate("/learning")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-white transition-colors"
            >
              <span>Resume</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080B16] border border-white/[0.06] flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block">
                Recently Viewed
              </span>
              <h4 className="text-xs font-bold text-white leading-snug">
                Day 3: Control Flows & Loops
              </h4>
            </div>
            <button
              onClick={() => navigate("/learning")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
            >
              <span>Review</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080B16] border border-white/[0.06] flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                Recommended
              </span>
              <h4 className="text-xs font-bold text-white leading-snug">
                Day 5: Error Handling & Exceptions
              </h4>
            </div>
            <button
              onClick={() => navigate("/learning")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors"
            >
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default React.memo(ActiveProjectCard);
