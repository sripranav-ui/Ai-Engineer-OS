import React from "react";

// =======================================================
// PanelLayout.jsx — Flexible Layout Engine
// =======================================================
// A composable layout system. Use these components to build
// split panes, multi-column dashboards, sidebars, etc.
// without repeating layout CSS.
//
// Components:
//   <PanelLayout>       — root flex/grid container
//   <PanelMain>         — primary content panel
//   <PanelSide>         — sidebar / secondary panel
//   <PanelGrid cols={}>  — n-column equal grid
//   <PanelStack>        — vertical stack of panels
//   <PanelRow>          — horizontal row of panels
//   <PanelFull>         — single full-width panel
//
// All panels accept:
//   className   — extra CSS classes
//   style       — inline style overrides
//   children    — content
// =======================================================

// ─── Root container ────────────────────────────────────

/**
 * Root panel layout — asymmetric main + side split.
 * Default: 60% / 40%
 */
export function PanelLayout({
  children,
  ratio = "60-40",
  gap = "md",
  className = "",
  style = {},
}) {
  const ratioMap = {
    "60-40": "1.5fr 1fr",
    "65-35": "1.85fr 1fr",
    "70-30": "2.33fr 1fr",
    "75-25": "3fr 1fr",
    "50-50": "1fr 1fr",
    "main":  "1fr",
  };
  const gapMap = { xs: "var(--space-3)", sm: "var(--space-4)", md: "var(--space-6)", lg: "var(--space-8)", xl: "var(--space-10)" };

  return (
    <div
      className={`panel-layout ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: ratioMap[ratio] || ratioMap["60-40"],
        gap: gapMap[gap] || gapMap["md"],
        alignItems: "start",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Panel slots ───────────────────────────────────────

/** Primary/main content area */
export function PanelMain({ children, className = "", style = {} }) {
  return (
    <div className={`panel-main ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Secondary/sidebar panel */
export function PanelSide({ children, className = "", style = {} }) {
  return (
    <div className={`panel-side ${className}`} style={style}>
      {children}
    </div>
  );
}

// ─── Grid layouts ──────────────────────────────────────

/**
 * Equal n-column grid.
 * @param {number} cols  — number of columns (default 3)
 * @param {number} minW  — minimum column width in px (default 260)
 */
export function PanelGrid({
  children,
  cols = 3,
  minW = 260,
  gap = "md",
  className = "",
  style = {},
}) {
  const gapMap = { xs: "var(--space-3)", sm: "var(--space-4)", md: "var(--space-5)", lg: "var(--space-6)", xl: "var(--space-8)" };
  return (
    <div
      className={`panel-grid ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(${minW}px, 1fr))`,
        gap: gapMap[gap] || gapMap["md"],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Stack / Row ───────────────────────────────────────

/** Vertical stack */
export function PanelStack({ children, gap = "md", className = "", style = {} }) {
  const gapMap = { xs: "var(--space-2)", sm: "var(--space-3)", md: "var(--space-5)", lg: "var(--space-6)", xl: "var(--space-8)" };
  return (
    <div
      className={`panel-stack ${className}`}
      style={{ display: "flex", flexDirection: "column", gap: gapMap[gap] || gapMap["md"], ...style }}
    >
      {children}
    </div>
  );
}

/** Horizontal row */
export function PanelRow({
  children,
  gap = "md",
  align = "start",
  wrap = false,
  className = "",
  style = {},
}) {
  const gapMap = { xs: "var(--space-2)", sm: "var(--space-3)", md: "var(--space-4)", lg: "var(--space-6)", xl: "var(--space-8)" };
  return (
    <div
      className={`panel-row ${className}`}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: gapMap[gap] || gapMap["md"],
        alignItems: align,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Single full-width section */
export function PanelFull({ children, className = "", style = {} }) {
  return (
    <div
      className={`panel-full ${className}`}
      style={{ width: "100%", ...style }}
    >
      {children}
    </div>
  );
}

// ─── Responsive wrappers ──────────────────────────────

/**
 * Responsive layout: renders as PanelLayout on desktop,
 * PanelStack on mobile (<= breakpoint).
 */
export function ResponsiveLayout({
  children,
  ratio = "60-40",
  gap = "md",
  breakpoint = 1100,
  className = "",
}) {
  return (
    <div
      className={`responsive-layout ${className}`}
      style={{ "--rl-breakpoint": `${breakpoint}px` }}
    >
      <PanelLayout ratio={ratio} gap={gap}>
        {children}
      </PanelLayout>
    </div>
  );
}

// Default export for convenience when only one variant is needed
export default PanelLayout;
