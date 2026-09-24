import React, { useState, useEffect, useContext, useMemo } from "react";
import AppContext from "../context/AppContext";
import { GamificationContext } from "../context/GamificationContext";
import { AuthContext } from "../context/AuthContext";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// Modular Phase 2 Dashboard Components
import TopCommandHeader from "../components/AIDashboard/TopCommandHeader.jsx";
import AICoreCenterpiece from "../components/AIDashboard/AICoreCenterpiece.jsx";
import TodayMissionCard from "../components/AIDashboard/TodayMissionCard.jsx";
import TelemetryPerformanceCard from "../components/AIDashboard/TelemetryPerformanceCard.jsx";
import ActiveProjectCard from "../components/AIDashboard/ActiveProjectCard.jsx";
import RecentActivityCard from "../components/AIDashboard/RecentActivityCard.jsx";

/**
 * DashboardPage.jsx — AI Engineer OS Command Center Orchestrator
 * Phase 2 Visual Transformation:
 * - Clean layout composition with strong visual hierarchy
 * - Futuristic AI Core visual centerpiece (WebGL Liquid Metal)
 * - Prominent Today's Mission with LiquidMetalButton primary CTA
 * - Realtime telemetry & Pomodoro focus studio
 * - Active engineering project node & curriculum pipeline
 * - Compact technical activity audit rows
 * - 100% preserved real state, handlers, and context bindings
 */
export function DashboardPage() {
  useDocumentMetadata(
    "Command Center",
    "AI Engineer OS central mission dashboard, active projects, curriculum pipeline, and Pomodoro focus studio."
  );

  // Real Application State from Contexts
  const { roadmap = [], projects = [], toggleDayCompletion } = useContext(AppContext);
  const { streak = 1, xp = 0 } = useContext(GamificationContext);
  const { user } = useContext(AuthContext);

  // --- Real Pomodoro Focus Studio State ---
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

  const handleTogglePomo = () => setPomoActive((prev) => !prev);
  const handleResetPomo = () => {
    setPomoActive(false);
    setPomoSecs(1500);
  };

  // Active Lesson & Active Project derived from real state
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
    <div className="min-h-full w-full bg-[#050508] text-slate-100 font-sans relative overflow-x-hidden p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 select-none">
      {/* ── Atmospheric Radial Gradients ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 w-[650px] h-[340px] bg-indigo-600/[0.07] rounded-full blur-[140px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-24 right-1/4 w-[480px] h-[300px] bg-violet-600/[0.06] rounded-full blur-[120px] pointer-events-none"
      />

      {/* ── 1. Top Command Header ── */}
      <TopCommandHeader user={user} activeWorkspaceName="AI Engineer OS" />

      {/* ── 2. Primary Hero / AI Core Visual Centerpiece ── */}
      <AICoreCenterpiece activeWorkspaceName="AI Engineer OS" />

      {/* ── 3. Main Command Grid: Primary Workstation (8 cols) + Telemetry Rail (4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (Main Workstation - 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Mission Glass Card (with LiquidMetalButton) */}
          <TodayMissionCard
            roadmap={roadmap}
            todayLesson={todayLesson}
            onCheckDay={toggleDayCompletion}
          />

          {/* Active Engineering Project Node */}
          <ActiveProjectCard activeProject={activeProj} />
        </div>

        {/* Right Column (Telemetry & Activity Rail - 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Telemetry & Pomodoro Focus Studio */}
          <TelemetryPerformanceCard
            streak={streak}
            xp={xp}
            user={user}
            pomoSecs={pomoSecs}
            pomoActive={pomoActive}
            formatPomoTime={formatPomoTime}
            onTogglePomo={handleTogglePomo}
            onResetPomo={handleResetPomo}
          />

          {/* Recent Activity Audit & System Health Rows */}
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}

export default React.memo(DashboardPage);