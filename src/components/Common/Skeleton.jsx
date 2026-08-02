import React from "react";

// =======================================================
// Skeleton.jsx — Shimmer Skeleton Loading Suite
// =======================================================
// Provides progressive loading skeletons for cards, lists,
// tables, and full pages to eliminate layout shifts.
// =======================================================

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  style = {},
}) {
  const customStyle = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={`skeleton-base skeleton-${variant} shimmer ${className}`}
      style={customStyle}
    />
  );
}

export function CardSkeleton({ rows = 2 }) {
  return (
    <div className="card skeleton-card" style={{ padding: "var(--space-6)" }}>
      <Skeleton variant="text" width="60%" height="20px" style={{ marginBottom: "var(--space-3)" }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i % 2 === 0 ? "90%" : "70%"} height="14px" style={{ marginBottom: "var(--space-2)" }} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3-5) var(--space-4)",
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <Skeleton variant="circle" width="32px" height="32px" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="45%" height="16px" style={{ marginBottom: "4px" }} />
            <Skeleton variant="text" width="75%" height="12px" />
          </div>
          <Skeleton variant="text" width="60px" height="20px" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "var(--space-4)",
          padding: "var(--space-4)",
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width="60%" height="14px" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "var(--space-4)",
            padding: "var(--space-4)",
            borderBottom: rIdx < rows - 1 ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} variant="text" width={cIdx === 0 ? "80%" : "50%"} height="14px" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="content fade-in" style={{ opacity: 0.7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <Skeleton variant="text" width="240px" height="32px" style={{ marginBottom: "8px" }} />
          <Skeleton variant="text" width="300px" height="16px" />
        </div>
        <Skeleton variant="text" width="120px" height="24px" />
      </div>

      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ height: "120px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Skeleton variant="circle" width="36px" height="36px" />
            <Skeleton variant="text" width="60%" height="20px" />
            <Skeleton variant="text" width="80%" height="14px" />
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
        </div>
        <div className="dashboard-side-col">
          <CardSkeleton rows={2} />
          <CardSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="content fade-in" style={{ opacity: 0.6 }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Skeleton variant="text" width="200px" height="32px" style={{ marginBottom: "8px" }} />
        <Skeleton variant="text" width="350px" height="16px" />
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-main-col">
          <CardSkeleton rows={3} />
          <CardSkeleton rows={3} />
        </div>
        <div className="dashboard-side-col">
          <CardSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}

export default React.memo(Skeleton);
