import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ShaderMount,
  liquidMetalFragmentShader,
  getShaderColorFromString,
} from "@paper-design/shaders";

/**
 * LiquidMetalButton.jsx — Phase 1 Design Foundation Interactive Component
 * Inspired by @paper-design/shaders liquid metal shader + Obsidian/Violet AI aesthetics.
 * Features:
 * - Animated WebGL liquid-metal shader with hover speed acceleration
 * - Click ripple physics with coordinate tracking & timer cleanup
 * - Text mode, Icon mode, and Combined mode
 * - Robust cleanup on unmount (ShaderMount.dispose(), timer clearing)
 * - Safe failover fallback if WebGL is unavailable or context fails
 * - Full accessible button semantics & keyboard interactions
 */
export function LiquidMetalButton({
  children,
  onClick,
  icon: Icon,
  iconPosition = "left",
  size = "md", // "sm" | "md" | "lg"
  speed = 0.35,
  hoverSpeed = 1.25,
  colorBack = "#090914",
  colorTint = "#7c3aed", // Rich violet/indigo
  disabled = false,
  className = "",
  type = "button",
  ariaLabel,
  style = {},
  ...props
}) {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  const isMountedRef = useRef(true);
  const rippleTimersRef = useRef([]);

  const [hasShaderError, setHasShaderError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  // --- WebGL Shader Initialization & Safe Lifecycle ---
  useEffect(() => {
    isMountedRef.current = true;
    const container = containerRef.current;
    if (!container) return;

    // Check if WebGL is available before attempting initialization
    let mountInstance = null;
    try {
      const uniforms = {
        u_colorBack: getShaderColorFromString(colorBack),
        u_colorTint: getShaderColorFromString(colorTint),
        u_softness: 0.38,
        u_repetition: 2.6,
        u_shiftRed: 0.22,
        u_shiftBlue: 0.36,
        u_distortion: 0.16,
        u_contour: 0.44,
        u_angle: 45.0,
        u_shape: 0.0,
        u_isImage: false,
      };

      mountInstance = new ShaderMount(
        container,
        liquidMetalFragmentShader,
        uniforms,
        { alpha: true, antialias: true, premultipliedAlpha: false },
        speed
      );
      mountRef.current = mountInstance;
    } catch (err) {
      // Gracefully switch to CSS gradient fallback without crashing
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
          // ignore disposal errors on teardown
        }
        mountRef.current = null;
      }
      // Clean up all pending ripple timers
      rippleTimersRef.current.forEach((t) => clearTimeout(t));
      rippleTimersRef.current = [];
    };
  }, [colorBack, colorTint, speed]);

  // --- Hover Speed Acceleration ---
  const handleMouseEnter = useCallback(
    (e) => {
      if (disabled) return;
      setIsHovered(true);
      if (mountRef.current) {
        mountRef.current.setSpeed(hoverSpeed);
      }
      props.onMouseEnter?.(e);
    },
    [disabled, hoverSpeed, props]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      setIsHovered(false);
      setIsPressed(false);
      if (mountRef.current) {
        mountRef.current.setSpeed(speed);
      }
      props.onMouseLeave?.(e);
    },
    [speed, props]
  );

  // --- Pressed State ---
  const handleMouseDown = useCallback(
    (e) => {
      if (disabled) return;
      setIsPressed(true);
      props.onMouseDown?.(e);
    },
    [disabled, props]
  );

  const handleMouseUp = useCallback(
    (e) => {
      setIsPressed(false);
      props.onMouseUp?.(e);
    },
    [props]
  );

  // --- Dynamic Click Ripple Effect ---
  const handleClick = useCallback(
    (e) => {
      if (disabled) return;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX ?? rect.left + rect.width / 2;
        const clientY = e.clientY ?? rect.top + rect.height / 2;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const rippleId = Date.now() + Math.random();
        const maxDimension = Math.max(rect.width, rect.height) * 2;

        setRipples((prev) => [...prev, { id: rippleId, x, y, size: maxDimension }]);

        const timer = setTimeout(() => {
          if (isMountedRef.current) {
            setRipples((prev) => prev.filter((r) => r.id !== rippleId));
          }
        }, 650);

        rippleTimersRef.current.push(timer);
      }

      onClick?.(e);
    },
    [disabled, onClick]
  );

  // --- Keyboard Accessibility ---
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.key === " ") e.preventDefault();
        handleClick(e);
      }
      props.onKeyDown?.(e);
    },
    [handleClick, props]
  );

  // --- Sizing Presets ---
  const sizeStyles = {
    sm: "h-9 px-3.5 text-xs gap-2 rounded-xl",
    md: "h-11 px-5 text-sm gap-2.5 rounded-2xl",
    lg: "h-13 px-7 text-base gap-3 rounded-2xl",
  }[size] || "h-11 px-5 text-sm gap-2.5 rounded-2xl";

  const isIconOnly = !children && Boolean(Icon);
  const iconOnlySizes = {
    sm: "w-9 h-9 p-0 rounded-xl",
    md: "w-11 h-11 p-0 rounded-2xl",
    lg: "w-13 h-13 p-0 rounded-2xl",
  }[size] || "w-11 h-11 p-0 rounded-2xl";

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === "string" ? children : "Action")}
      tabIndex={disabled ? -1 : 0}
      className={`group relative inline-flex items-center justify-center font-sans font-semibold tracking-tight text-white select-none outline-none transition-all duration-200 ${
        isIconOnly ? iconOnlySizes : sizeStyles
      } ${
        disabled
          ? "opacity-40 cursor-not-allowed filter grayscale"
          : "cursor-pointer active:scale-[0.98]"
      } ${className}`}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* Outer Glow Halo (Restrained Violet/Indigo) */}
      <span
        aria-hidden="true"
        className={`absolute -inset-[2px] rounded-2xl pointer-events-none transition-all duration-300 ${
          isHovered && !disabled
            ? "opacity-100 blur-md bg-gradient-to-r from-violet-600/40 via-indigo-500/50 to-purple-600/40"
            : "opacity-40 blur-sm bg-gradient-to-r from-violet-700/20 via-indigo-600/20 to-purple-700/20"
        }`}
      />

      {/* Outer Border Layer */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-2xl border pointer-events-none transition-colors duration-200 ${
          isHovered && !disabled
            ? "border-violet-400/50 shadow-[0_0_16px_rgba(139,92,246,0.35)]"
            : "border-white/[0.12] shadow-[0_0_8px_rgba(99,102,241,0.15)]"
        }`}
      />

      {/* Liquid Metal Shader Canvas Mount Container */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
      >
        {/* CSS Fallback if WebGL fails or is unavailable */}
        {hasShaderError && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b103c] via-[#2d1b69] to-[#0a071b] animate-pulse" />
        )}
      </div>

      {/* Glossy Obsidian Top Cap (Reference 3D Two-Tier Geometry) */}
      <div
        aria-hidden="true"
        className={`absolute inset-[1.5px] rounded-[14px] pointer-events-none transition-all duration-200 bg-[#070913]/65 backdrop-blur-[2px] border-t border-white/[0.22] border-b border-black/40 ${
          isPressed ? "bg-[#05070e]/80" : isHovered ? "bg-[#080b18]/50" : ""
        }`}
      />

      {/* Click Ripple Elements */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ping pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              animationDuration: "600ms",
              animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
            }}
          />
        ))}
      </div>

      {/* Button Content (Text & Icons) */}
      <span className="relative z-10 inline-flex items-center justify-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {Icon && iconPosition === "left" && (
          <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
            {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 text-violet-300" />}
          </span>
        )}

        {children && <span>{children}</span>}

        {Icon && iconPosition === "right" && (
          <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
            {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 text-violet-300" />}
          </span>
        )}
      </span>
    </button>
  );
}

export default React.memo(LiquidMetalButton);
