import React from "react";

// =======================================================
// CircularProgress.jsx
// Reusable Premium SVG-based Circular Progress Meter
// =======================================================

function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  subLabel,
  color = "var(--primary, #3b82f6)",
  glow = true,
}) {
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);
  
  // Calculate SVG geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  // Unique identifier for gradients
  const gradientId = `circular-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)",
          filter: glow ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.15))" : "none",
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* Circle Track Backdrop */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s ease-in-out",
          }}
        />
      </svg>

      {/* Centered Labels */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        {label && (
          <span style={{ fontSize: `${size * 0.15}px`, fontWeight: "800", color: "#ffffff", lineHeight: 1 }}>
            {label}
          </span>
        )}
        {subLabel && (
          <span style={{ fontSize: `${size * 0.09}px`, fontWeight: "600", color: "#94a3b8", marginTop: "4px" }}>
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default React.memo(CircularProgress);
