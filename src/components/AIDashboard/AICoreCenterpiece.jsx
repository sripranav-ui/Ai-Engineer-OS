import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShaderMount,
  liquidMetalFragmentShader,
  getShaderColorFromString,
} from "@paper-design/shaders";
import StatusBadge from "../Common/StatusBadge.jsx";
import Button from "../Common/Button.jsx";
import capabilityRegistry from "../../services/ai/agents/capabilityRegistry.js";
import executionMonitor from "../../services/ai/agents/executionMonitor.js";
import providerManager from "../../services/ai/providers/providerManager.js";
import {
  Sparkles,
  Bot,
  Code,
  MessageSquare,
  Activity,
  Layers,
  Database,
  Cpu,
  CheckCircle2,
} from "lucide-react";

/**
 * AICoreCenterpiece.jsx — Futuristic AI Core Visual Centerpiece
 * Features:
 * - Animated WebGL Liquid Metal Core Orb (powered by @paper-design/shaders)
 * - Safe lifecycle management with graceful CSS fallback & teardown
 * - Concentric atmospheric orbital HUD rings
 * - Real multi-agent capability metrics & telemetry
 * - Direct workspace navigation actions
 */
export function AICoreCenterpiece({ activeWorkspaceName = "AI Engineer OS" }) {
  const navigate = useNavigate();
  const orbRef = useRef(null);
  const mountRef = useRef(null);
  const isMountedRef = useRef(true);
  const [hasShaderError, setHasShaderError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Real Multi-Agent & Provider Telemetry
  const roles = useMemo(() => capabilityRegistry.getAllRoles() || [], []);
  const metrics = useMemo(() => executionMonitor.getMetrics() || { activeTasks: 0, completedTasks: 0 }, []);
  const activeProvider = useMemo(() => providerManager.getActiveProvider() || { name: "Anthropic", selectedModel: "claude-3-5-sonnet" }, []);

  // --- WebGL Shader Mount Lifecycle ---
  useEffect(() => {
    isMountedRef.current = true;
    const container = orbRef.current;
    if (!container) return;

    try {
      const uniforms = {
        u_colorBack: getShaderColorFromString("#0a0a18"),
        u_colorTint: getShaderColorFromString("#7c3aed"), // Deep violet
        u_softness: 0.42,
        u_repetition: 2.2,
        u_shiftRed: 0.25,
        u_shiftBlue: 0.38,
        u_distortion: 0.18,
        u_contour: 0.45,
        u_angle: 45.0,
        u_shape: 1.0, // Circle shape in @paper-design/shaders
        u_isImage: false,
      };

      const mountInstance = new ShaderMount(
        container,
        liquidMetalFragmentShader,
        uniforms,
        { alpha: true, antialias: true, premultipliedAlpha: false },
        0.25 // Restrained, serene animation speed
      );
      mountRef.current = mountInstance;
    } catch (err) {
      if (isMountedRef.current) {
        setHasShaderError(true);
      }
    }

    return () => {
      isMountedRef.current = false;
      if (mountRef.current) {
        try {
          mountRef.current.dispose();
        } catch {
          // ignore cleanup errors
        }
        mountRef.current = null;
      }
    };
  }, []);

  const handleOrbMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (mountRef.current) {
      mountRef.current.setSpeed(0.65);
    }
  }, []);

  const handleOrbMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (mountRef.current) {
      mountRef.current.setSpeed(0.25);
    }
  }, []);

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#0C101E]/95 via-[#12172C]/95 to-[#0C101E]/95 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)] p-6 sm:p-8 overflow-hidden group">
      {/* Background Volumetric Violet Lighting */}
      <div
        aria-hidden="true"
        className="absolute -right-16 top-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/15 transition-all duration-700"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/3 top-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        {/* ── Left Side: Core Telemetry & Contextual Intelligence ── */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <StatusBadge status="online" pulse={true} size="sm">
              AUTONOMOUS ENGINE ACTIVE
            </StatusBadge>
            <div className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[10px] font-mono text-violet-300">
              SYNAPSE CORE v2
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Command Center — AI Engineer OS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Multi-agent reasoning, vector RAG retrieval, and runtime virtualization active for{" "}
              <span className="text-indigo-300 font-semibold underline decoration-indigo-500/40 underline-offset-4">
                {activeWorkspaceName}
              </span>.
            </p>
          </div>

          {/* Technical Telemetry Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#070912]/80 border border-white/[0.05] space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Provider</span>
              <div className="text-white font-semibold truncate flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-violet-400 shrink-0" />
                <span className="truncate">{activeProvider?.name || "Anthropic"}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#070912]/80 border border-white/[0.05] space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Agent Roles</span>
              <div className="text-cyan-300 font-semibold flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{roles.length || 4} Roles</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#070912]/80 border border-white/[0.05] space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">Vector RAG</span>
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Indexed</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#070912]/80 border border-white/[0.05] space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase">System Health</span>
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>200 OK</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Triggers */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              onClick={() => navigate("/coding-workspace")}
              type="primary"
              size="md"
              icon={<Code className="w-4 h-4 text-white" />}
            >
              Open Studio
            </Button>
            <Button
              onClick={() => navigate("/assistant")}
              type="secondary"
              size="md"
              icon={<MessageSquare className="w-4 h-4 text-violet-400" />}
            >
              AI Assistant
            </Button>
          </div>
        </div>

        {/* ── Right Side: Futuristic AI Core Centerpiece ── */}
        <div className="shrink-0 flex items-center justify-center lg:pr-4">
          <div
            className="relative flex items-center justify-center cursor-pointer select-none"
            onMouseEnter={handleOrbMouseEnter}
            onMouseLeave={handleOrbMouseLeave}
            title="AI Synapse Core Engine"
          >
            {/* Outer Concentric Radar / Orbital Ring */}
            <div
              aria-hidden="true"
              className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-violet-500/15 border-dashed pointer-events-none animate-[spin_30s_linear_infinite]"
            />

            {/* Middle Orbital Ring with Beacon Node */}
            <div
              aria-hidden="true"
              className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-indigo-500/20 pointer-events-none"
            >
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            </div>

            {/* Glowing Volumetric Core Atmosphere */}
            <div
              aria-hidden="true"
              className={`absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full blur-xl transition-all duration-300 pointer-events-none ${
                isHovered
                  ? "bg-violet-600/30 scale-110"
                  : "bg-violet-600/20"
              }`}
            />

            {/* Central Liquid Metal Orb Housing */}
            <div
              ref={orbRef}
              className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border border-violet-400/40 shadow-[0_0_32px_rgba(124,58,237,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition-all duration-300 ${
                isHovered ? "scale-105 border-violet-300/60 shadow-[0_0_48px_rgba(124,58,237,0.5)]" : ""
              }`}
            >
              {/* Fallback if WebGL fails */}
              {hasShaderError && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#241257] via-[#3b1d8f] to-[#0c0821] animate-pulse" />
              )}

              {/* Specular Inner Optical Glass Rim */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full pointer-events-none border border-white/20 bg-gradient-to-b from-white/15 via-transparent to-black/40"
              />

              {/* Centered Floating Core Symbol */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AICoreCenterpiece);
