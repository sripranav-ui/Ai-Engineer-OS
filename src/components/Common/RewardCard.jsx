import React from "react";
import Button from "./Button";

// =======================================================
// RewardCard.jsx
// Daily reward slot tracker mapping claimed and unlocked statuses
// =======================================================

function RewardCard({
  dayNumber,
  xpValue,
  isClaimed,
  isActive,
  onClaim,
  disabled = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 12px",
        borderRadius: "14px",
        background: isClaimed
          ? "rgba(16, 185, 129, 0.04)"
          : isActive
          ? "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(30, 41, 59, 0.5))"
          : "rgba(255, 255, 255, 0.01)",
        border: isClaimed
          ? "1px solid rgba(16, 185, 129, 0.15)"
          : isActive
          ? "1.5px solid rgba(245, 158, 11, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.04)",
        opacity: isClaimed ? 0.7 : 1,
        transition: "all 0.25s ease",
        textAlign: "center",
        position: "relative",
        boxShadow: isActive ? "0 0 15px rgba(245, 158, 11, 0.1)" : "none",
      }}
      className={isActive && !isClaimed ? "active-reward-card" : ""}
    >
      {/* Day label */}
      <span
        style={{
          fontSize: "12px",
          color: isActive ? "#f59e0b" : "#94a3b8",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Day {dayNumber}
      </span>

      {/* Reward amount */}
      <div style={{ margin: "14px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "28px", display: "block" }}>
          {dayNumber === 7 ? "💎" : "✨"}
        </span>
        <strong style={{ fontSize: "16px", color: "#ffffff", marginTop: "4px" }}>
          {xpValue} XP
        </strong>
      </div>

      {/* Claim Button / Status info */}
      {isClaimed ? (
        <span
          style={{
            fontSize: "12px",
            color: "#10b981",
            fontWeight: "700",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ✓ Claimed
        </span>
      ) : isActive ? (
        <Button
          onClick={onClaim}
          type="primary"
          disabled={disabled}
          style={{
            padding: "6px 14px",
            fontSize: "12px",
            background: "#f59e0b",
            borderColor: "#d97706",
            color: "#0f172a",
            fontWeight: "800",
          }}
        >
          Claim
        </Button>
      ) : (
        <span
          style={{
            fontSize: "12px",
            color: "#475569",
            fontWeight: "700",
            padding: "6px 12px",
          }}
        >
          🔒 Locked
        </span>
      )}
    </div>
  );
}

export default React.memo(RewardCard);
