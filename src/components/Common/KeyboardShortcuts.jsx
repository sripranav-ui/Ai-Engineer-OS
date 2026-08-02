import React from "react";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";

/**
 * KeyboardShortcuts Cheatsheet Modal Component
 */
function KeyboardShortcuts({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutsList = [
    { key: "g + d", desc: "Go to Dashboard Analytics" },
    { key: "g + w", desc: "Go to AI Coding Workspace" },
    { key: "g + j", desc: "Go to AI Career Coach" },
    { key: "g + c", desc: "Go to Community Hub" },
    { key: "g + l", desc: "Go to Learning Center" },
    { key: "g + r", desc: "Go to Roadmap Tracker" },
    { key: "g + p", desc: "Go to Study Planner" },
    { key: "g + k", desc: "Go to Knowledge Hub" },
    { key: "g + s", desc: "Go to Settings Preferences" },
    { key: "g + g", desc: "Go to Quest Hub Streaks" },
    { key: "g + a", desc: "Go to AI Assistant Console" },
    { key: "g + t", desc: "Go to Portfolio Hub" },
    { key: "g + b", desc: "Go to Resume Builder" },
    { key: "g + i", desc: "Go to Interview Prep" },
    { key: "g + n", desc: "Go to Notes Page" },
    { key: "g + m", desc: "Go to Projects Kanban" },
    { key: "g + e", desc: "Go to Certificates Locker" },
    { key: "g + y", desc: "Go to Career Tracker" },
  ];

  const coreUtils = [
    { key: "Ctrl + K", desc: "Open Command Palette Search" },
    { key: "?", desc: "Toggle this Keyboard Cheatsheet" },
    { key: "Escape", desc: "Dismiss active modals / overlays" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(11, 15, 25, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        fontFamily: "system-ui, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        className="modal-scale-enter"
        style={{
          width: "100%",
          maxWidth: "640px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          padding: "30px",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "15px", marginBottom: "20px" }}>
          <div>
            <h3 style={{ color: "white", margin: 0, fontSize: "18px", fontWeight: "800" }}>
              ⌨️ Global Keyboard Shortcuts
            </h3>
            <p style={{ margin: "4px 0 0 0", color: "var(--light-text)", fontSize: "12.5px" }}>
              Accelerate your workflow with sequential keystrokes and controls.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label="Close keyboard shortcuts help dialog"
          >
            ✕
          </button>
        </div>

        {/* Global utility controls */}
        <div style={{ marginBottom: "20px" }}>
          <span className="community-section-label" style={{ fontSize: "10px", color: "var(--primary)", display: "block", marginBottom: "10px" }}>
            CORE UTILITIES
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {coreUtils.map((util, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text)" }}>{util.desc}</span>
                <kbd style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", color: "white", fontWeight: "700" }}>
                  {util.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation sequencing list */}
        <div>
          <span className="community-section-label" style={{ fontSize: "10px", color: "var(--primary)", display: "block", marginBottom: "10px" }}>
            SEQUENTIAL NAVIGATION (Press G then...)
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "250px", overflowY: "auto", paddingRight: "5px" }}>
            {shortcutsList.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--text)" }}>{item.desc}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <kbd style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px", color: "white" }}>g</kbd>
                  <span style={{ color: "var(--light-text)", fontSize: "10px" }}>➔</span>
                  <kbd style={{ background: "var(--primary)", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px", color: "black", fontWeight: "bold" }}>{item.key.split("+")[1].trim()}</kbd>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px", borderTop: "1px solid var(--border)", paddingTop: "15px" }}>
          <Button onClick={onClose} type="primary" style={{ padding: "8px 20px" }}>
            Dismiss Rules
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(KeyboardShortcuts);
