import React, { useContext } from "react";
import { GamificationContext } from "../../context/GamificationContext";

// =======================================================
// AchievementPopup.jsx
// Animated global slide-in toast alert for achievement unlocks
// =======================================================

function AchievementPopup() {
  const { activePopup, setActivePopup } = useContext(GamificationContext);

  if (!activePopup) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        width: "350px",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(12px)",
        border: "2px solid rgba(245, 158, 11, 0.4)",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.15)",
        padding: "18px",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
      className="achievement-popup-toast"
    >
      {/* Icon Badge */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          boxShadow: "0 0 10px rgba(245, 158, 11, 0.2)",
        }}
      >
        {activePopup.icon}
      </div>

      {/* Message content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: "11px",
            color: "#f59e0b",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            display: "block",
          }}
        >
          🏆 Achievement Unlocked!
        </span>
        <h4 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: "800", color: "#ffffff" }}>
          {activePopup.title}
        </h4>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8", lineHeight: "1.4" }}>
          {activePopup.desc}
        </p>
        <span
          style={{
            display: "inline-block",
            marginTop: "8px",
            fontSize: "11px",
            background: "rgba(16, 185, 129, 0.12)",
            color: "#10b981",
            padding: "2px 8px",
            borderRadius: "6px",
            fontWeight: "700",
          }}
        >
          +{activePopup.xpReward} XP Awarded
        </span>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => setActivePopup(null)}
        style={{
          background: "none",
          border: "none",
          color: "#64748b",
          fontSize: "18px",
          fontWeight: "700",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
          transition: "color 0.2s",
        }}
        title="Dismiss Alert"
      >
        ×
      </button>
    </div>
  );
}

export default React.memo(AchievementPopup);
