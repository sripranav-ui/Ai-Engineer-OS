import React, { useEffect, useRef } from "react";

// =======================================================
// Modal.jsx — Reusable Modal Dialog
// =======================================================
// Props:
//   isOpen    — boolean
//   onClose   — () => void
//   title     — string
//   children  — body content
//   actions   — ReactNode rendered in modal-actions footer
//   size      — "sm" | "md" | "lg" | "xl" (default "md")
//   closeOnBackdrop — boolean (default true)
// =======================================================

function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = "md",
  closeOnBackdrop = true,
}) {
  const contentRef = useRef(null);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus trap — focus modal on open
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        className={`modal-content modal-content--${size}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

export default React.memo(Modal);
