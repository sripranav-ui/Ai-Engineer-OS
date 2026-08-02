import React, { useEffect, useRef } from "react";

// =======================================================
// Drawer.jsx — Reusable Sliding Side Drawer
// =======================================================
// Props:
//   isOpen    — boolean
//   onClose   — () => void
//   title     — string
//   side      — "right" | "left" (default "right")
//   width     — CSS width string (default "380px")
//   children  — content
// =======================================================

function Drawer({ isOpen, onClose, title, children, side = "right", width = "380px" }) {
  const panelRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Return focus to trigger element on close
  const triggerRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      setTimeout(() => { if (panelRef.current) panelRef.current.focus(); }, 50);
    } else {
      if (triggerRef.current) triggerRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        ref={panelRef}
        className={`drawer-panel drawer-panel--${side}`}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="drawer-header">
          <h3 id="drawer-title" className="drawer-title">{title}</h3>
          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Drawer);
