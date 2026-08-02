import React from "react";

// =======================================================
// ProgressBar.jsx
// Reusable Progress Bar Component with Custom Variants
// =======================================================

function ProgressBar({
  progress,
  label,
  showValue = true,
  height = "18px",
  variant = "primary",
  minimal = false,
}) {
  const normalizedProgress = Math.min(Math.max(progress || 0, 0), 100);

  // Dynamic background gradients based on status/variant
  let gradient = "linear-gradient(90deg, #38bdf8, #2563eb)"; // Primary Blue
  if (variant === "success" || normalizedProgress === 100) {
    gradient = "linear-gradient(90deg, #10b981, #059669)"; // Completed Success Green
  } else if (variant === "warning") {
    gradient = "linear-gradient(90deg, #f59e0b, #d97706)"; // Warning Orange
  } else if (variant === "danger") {
    gradient = "linear-gradient(90deg, #ef4444, #dc2626)"; // Danger Red
  }

  if (minimal) {
    return (
      <div className="progress-container" style={{ height, marginTop: "8px", overflow: "hidden" }}>
        <div
          className="progress-fill"
          style={{
            width: `${normalizedProgress}%`,
            background: gradient,
            height: "100%",
            borderRadius: "10px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    );
  }

  return (
    <div className="progress-section" style={{ margin: "20px 0" }}>
      {(label || showValue) && (
        <div
          className="progress-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {label && <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>{label}</h3>}
          {showValue && (
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>
              {normalizedProgress}%
            </span>
          )}
        </div>
      )}

      <div className="progress-container" style={{ height, overflow: "hidden" }}>
        <div
          className="progress-fill"
          style={{
            width: `${normalizedProgress}%`,
            background: gradient,
            height: "100%",
            borderRadius: "10px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

export default React.memo(ProgressBar);