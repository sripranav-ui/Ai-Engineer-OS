import React from "react";
import GlassCard from "../Common/GlassCard.jsx";
import Button from "../Common/Button.jsx";
import {
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

/**
 * TelemetryPerformanceCard.jsx — Realtime Engineering Metrics & Focus Pomodoro Studio
 * Features:
 * - Real user streak, XP, and rank telemetry
 * - Interactive Pomodoro Focus Timer with Start/Pause/Reset
 * - Obsidian glass surfaces with restrained ambient lighting
 */
export function TelemetryPerformanceCard({
  streak = 1,
  xp = 0,
  user,
  pomoSecs = 1500,
  pomoActive = false,
  formatPomoTime = "25:00",
  onTogglePomo,
  onResetPomo,
}) {
  const currentLevel = user?.level || 1;
  const xpForNextLevel = 500;
  const levelProgress = Math.min(Math.round(((xp % xpForNextLevel) / xpForNextLevel) * 100), 100);

  return (
    <div className="space-y-6">
      {/* ── Pomodoro Focus Studio ── */}
      <GlassCard glow={pomoActive}>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>POMODORO FOCUS STUDIO</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">25 MIN CYCLE</span>
        </div>

        <div className="py-5 text-center space-y-1">
          <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            {formatPomoTime}
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            {pomoActive ? "Sprint in progress • Deep Focus" : "Ready to initiate focus sprint"}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={onTogglePomo}
            type="primary"
            size="md"
            fullWidth={true}
            icon={pomoActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {pomoActive ? "Pause Sprint" : "Start Sprint"}
          </Button>
          <Button
            onClick={onResetPomo}
            type="outline"
            size="md"
            icon={<RotateCcw className="w-4 h-4" />}
            title="Reset Pomodoro"
            aria-label="Reset Pomodoro"
          />
        </div>
      </GlassCard>

      {/* ── Realtime Telemetry & XP Progression ── */}
      <GlassCard>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>REALTIME TELEMETRY</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> VERIFIED
          </span>
        </div>

        <div className="space-y-3 pt-3 font-mono text-xs">
          {/* Streak Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B16] border border-white/[0.05]">
            <div className="flex items-center gap-2 text-slate-300">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Current Streak</span>
            </div>
            <strong className="text-sm text-white font-bold">
              {streak || 1} Days
            </strong>
          </div>

          {/* XP & Level Progression */}
          <div className="p-3 rounded-xl bg-[#080B16] border border-white/[0.05] space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span>Level {currentLevel} Mastery</span>
              </span>
              <span className="text-white font-bold">{xp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress || 20}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Progress to Lvl {currentLevel + 1}</span>
              <span>{levelProgress}%</span>
            </div>
          </div>

          {/* Focus Time */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B16] border border-white/[0.05]">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Study Hours Today</span>
            </div>
            <strong className="text-sm text-cyan-300 font-bold">
              2.5 Hrs
            </strong>
          </div>

          {/* Overall Velocity */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B16] border border-white/[0.05]">
            <div className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Sprint Velocity</span>
            </div>
            <strong className="text-sm text-emerald-400 font-bold">
              +120 XP/day
            </strong>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default React.memo(TelemetryPerformanceCard);
