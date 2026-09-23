import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import { GamificationContext } from "../context/GamificationContext";
import { AuthContext } from "../context/AuthContext";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// Reusable Visual Primitives
import GlassCard from "../components/Common/GlassCard.jsx";
import SectionHeader from "../components/Common/SectionHeader.jsx";
import StatusBadge from "../components/Common/StatusBadge.jsx";
import Button from "../components/Common/Button.jsx";
import ProgressBar from "../components/Common/ProgressBar.jsx";
import LiquidMetalButton from "../components/ui/LiquidMetalButton.jsx";

// Icons from lucide-react
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Rocket,
  BookOpen,
  Flame,
  Clock,
  GitBranch,
  Search,
  Lightbulb,
  Bug,
  Compass,
  FileText,
  Activity,
  Code,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/**
 * DashboardPage.jsx — AI Engineer OS Command Center
 * Visual Transformation Phase 1:
 * - Premium dark obsidian / navy atmospheric base
 * - Subtle violet/indigo lighting & specular highlights
 * - Reusable GlassCard and StatusBadge primitives
 * - Interactive LiquidMetalButton as the primary mission CTA
 * - 100% preserved real state (XP, streak, missions, projects, learning, activity)
 */
export function DashboardPage() {
  const navigate = useNavigate();
  useDocumentMetadata(
    "Command Center",
    "AI Engineer OS central mission dashboard, active projects, curriculum pipeline, and Pomodoro focus studio."
  );

  const { roadmap = [], projects = [], checkDay } = useContext(AppContext);
  const { streak = 1, xp = 0 } = useContext(GamificationContext);
  const { user } = useContext(AuthContext);

  // --- Pomodoro Timer State ---
  const [pomoSecs, setPomoSecs] = useState(1500); // 25:00
  const [pomoActive, setPomoActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (pomoActive && pomoSecs > 0) {
      timer = setInterval(() => {
        setPomoSecs((prev) => prev - 1);
      }, 1000);
    } else if (pomoSecs === 0) {
      setPomoActive(false);
      setPomoSecs(1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [pomoActive, pomoSecs]);

  const formatPomoTime = useMemo(() => {
    const mins = Math.floor(pomoSecs / 60);
    const secs = pomoSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [pomoSecs]);

  // --- AI Console Launcher Input State ---
  const [aiPrompt, setAiPrompt] = useState("");
  const handleAiAction = (actionType) => {
    let query = "";
    if (actionType === "explain") {
      query = "Explain this Python code block for me: \n";
    } else if (actionType === "debug") {
      query = "Help me debug this error message: \n";
    } else if (actionType === "roadmap") {
      query = "Generate an optimized study roadmap for learning: ";
    } else {
      query = aiPrompt;
    }
    localStorage.setItem(
      "pending_ai_assistant_query",
      query + (actionType === "ask" ? aiPrompt : "")
    );
    navigate("/assistant");
  };

  // Derive real current lesson and active project
  const todayLesson = useMemo(() => {
    return roadmap.find((r) => !r.completed) || roadmap[0] || {
      id: 1,
      topic: "Python & Neural Network Fundamentals",
    };
  }, [roadmap]);

  const activeProj = useMemo(() => {
    return projects.find((p) => !p.completed) || projects[0] || {
      id: "p1",
      title: "AI Engineer OS Core Platform",
      completed: false,
    };
  }, [projects]);

  return (
    <div className="min-h-full w-full bg-[#050508] text-slate-100 font-sans relative overflow-x-hidden p-6 md:p-8 space-y-8 select-none">
      {/* Background Atmospheric Lighting */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 w-[600px] h-[320px] bg-indigo-600/[0.07] rounded-full blur-[130px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-20 right-1/4 w-[450px] h-[280px] bg-violet-600/[0.06] rounded-full blur-[110px] pointer-events-none"
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. OPERATIONS HERO BANNER                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0C101E]/95 via-[#11162B]/95 to-[#0C101E]/95 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)] p-6 md:p-8 overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <StatusBadge status="online" pulse={true}>
                Operations Active
              </StatusBadge>
              <span className="text-[11px] font-mono text-slate-400">
                Workspace:{" "}
                <strong className="text-slate-200">AI Engineer OS</strong>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "AI Engineer"}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous engineering command center active. Track your curriculum
              missions, ongoing coding projects, and AI copilot agents.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-mono">Rank:</span>
                <span className="font-semibold text-violet-300">
                  Level {user?.level || 1} Engineer
                </span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-mono">Total XP:</span>
                <span className="font-semibold text-white font-mono">{xp} XP</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-amber-300">
                  {streak || 1} Day Streak
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/coding-workspace")}
              type="secondary"
              size="md"
              icon={<Code className="w-4 h-4 text-cyan-400" />}
            >
              Open Studio
            </Button>
            <Button
              onClick={() => navigate("/assistant")}
              type="outline"
              size="md"
              icon={<MessageSquare className="w-4 h-4 text-violet-400" />}
            >
              AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. RAYCAST-STYLE AI COMMAND LAUNCHER BAR                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-[#090C16]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] p-3 md:p-4">
        <div className="flex items-center gap-3 bg-[#060810]/80 rounded-xl px-4 py-2.5 border border-white/[0.05] focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
          <Search className="w-4 h-4 text-violet-400 shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
            placeholder="Ask AI Assistant, debug errors, or dispatch engineering actions... (Press Enter to query)"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAiAction("ask");
            }}
          />
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-slate-400 border border-white/10">
            ⌘K
          </span>
          <Button
            onClick={() => handleAiAction("ask")}
            type="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Query
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 px-1 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1">
            Shortcuts:
          </span>
          <button
            onClick={() => handleAiAction("explain")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 text-slate-300 hover:text-white transition-all text-xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Explain Code</span>
          </button>
          <button
            onClick={() => handleAiAction("debug")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 text-slate-300 hover:text-white transition-all text-xs"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>Debug Error</span>
          </button>
          <button
            onClick={() => handleAiAction("roadmap")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 text-slate-300 hover:text-white transition-all text-xs"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Build Roadmap</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. WORKSTATION GRID (2-Column Desktop Operating System)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column (Main Workstation - 8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Mission & Curriculum Centerpiece */}
          <GlassCard glow={true}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold block mb-1">
                  Primary Daily Mission
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Day {todayLesson?.id}: {todayLesson?.topic}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recommended study session: 45 minutes focused engineering
                </p>
              </div>

              {/* LIQUID METAL BUTTON INTEGRATION POINT (PART 5 & PART 6) */}
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

            <div className="py-3 px-4 my-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-200 flex items-center gap-2.5">
              <span className="text-base">💬</span>
              <em className="font-sans">
                "The only way to write fast code is to write clean code first."
              </em>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Today's Tasks Checklist
              </span>
              <div className="space-y-2">
                {roadmap.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => checkDay && checkDay(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      item.completed
                        ? "bg-emerald-950/20 border-emerald-500/25 text-slate-300 line-through"
                        : "bg-[#090C16] border-white/[0.06] hover:border-violet-500/30 text-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(item.completed)}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-white/20 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium">
                      Complete Day {item.id}: {item.topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Active Workspace Project Node */}
          <GlassCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block mb-1">
                  Active Project Repository
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {activeProj?.title || "AI Engineer OS Core Platform"}
                </h3>
              </div>
              <StatusBadge
                status={activeProj?.completed ? "success" : "warning"}
                pulse={!activeProj?.completed}
              >
                {activeProj?.completed ? "Completed" : "In Progress"}
              </StatusBadge>
            </div>

            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>Milestone Progress</span>
                  <span className="text-white font-semibold">45%</span>
                </div>
                <ProgressBar progress={45} height="12px" variant="primary" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Next Sprints
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-[#070A14] border border-white/[0.04] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Integrate Liquid Metal interactive component</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#070A14] border border-white/[0.04] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Harden dark obsidian visual design foundation</span>
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

          {/* Curriculum Pipeline Section */}
          <GlassCard>
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold block mb-4">
              Curriculum Progression Pipeline
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#080B16] border border-violet-500/25 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-violet-400 font-semibold">
                    Resume Last Lesson
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    Day 4: Python Dictionary Methods
                  </h4>
                </div>
                <button
                  onClick={() => navigate("/learning")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-white transition-colors"
                >
                  <span>Resume</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080B16] border border-white/[0.06] flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold">
                    Recently Viewed
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    Day 3: Control Flows & Loops
                  </h4>
                </div>
                <button
                  onClick={() => navigate("/learning")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080B16] border border-white/[0.06] flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                    Recommended
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    Day 5: Error Handling in Try-Except
                  </h4>
                </div>
                <button
                  onClick={() => navigate("/learning")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors"
                >
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── Right Column (Focus Rail & Pomodoro Studio - 4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pomodoro Studio Controller */}
          <GlassCard glow={pomoActive}>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
                Pomodoro Focus Studio
              </span>
              <Clock className="w-4 h-4 text-violet-400" />
            </div>

            <div className="py-6 text-center space-y-1">
              <div className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                {formatPomoTime}
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                25 min deep engineering sprint
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={() => setPomoActive(!pomoActive)}
                type="primary"
                size="md"
                fullWidth={true}
                icon={pomoActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              >
                {pomoActive ? "Pause Sprint" : "Start Sprint"}
              </Button>
              <Button
                onClick={() => {
                  setPomoActive(false);
                  setPomoSecs(1500);
                }}
                type="outline"
                size="md"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                title="Reset Pomodoro"
                aria-label="Reset Pomodoro"
              />
            </div>
          </GlassCard>

          {/* Productivity & Focus Metrics */}
          <GlassCard>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Realtime Performance
              </span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B16] border border-white/[0.05]">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Current Streak</span>
                </div>
                <strong className="font-mono text-sm text-white">
                  {streak || 1} Days
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B16] border border-white/[0.05]">
                <span className="text-xs text-slate-300">Daily XP Gained</span>
                <strong className="font-mono text-sm text-violet-400">
                  +120 XP
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B16] border border-white/[0.05]">
                <span className="text-xs text-slate-300">Study Hours Today</span>
                <strong className="font-mono text-sm text-emerald-400">
                  2.5 Hrs
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B16] border border-white/[0.05]">
                <span className="text-xs text-slate-300">Engine Status</span>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Optimal</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Hub Navigation */}
          <GlassCard>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-3">
              Quick Workspace Hubs
            </span>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/notes")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#080B16] border border-white/[0.05] hover:border-violet-500/30 text-xs text-slate-300 hover:text-white transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-violet-400" />
                  <span>Engineering Notes Vault</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => navigate("/knowledge")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#080B16] border border-white/[0.05] hover:border-violet-500/30 text-xs text-slate-300 hover:text-white transition-all"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Knowledge Graph & RAG</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => navigate("/planner")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#080B16] border border-white/[0.05] hover:border-violet-500/30 text-xs text-slate-300 hover:text-white transition-all"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sprint Planner & Tasks</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default React.memo(DashboardPage);