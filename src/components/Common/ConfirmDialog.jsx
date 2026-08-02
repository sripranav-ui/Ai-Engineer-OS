import React, { useContext, useEffect, useRef } from "react";
import { UIContext, useUI } from "../../context/UIContext";

// =======================================================
// ConfirmDialog.jsx — Global Confirmation Modal
// =======================================================
// Replaces window.confirm() and alert() throughout the app.
// Consumed exclusively through UIContext.confirm().
//
// Usage in any component:
//   const { confirm } = useUI();
//   const ok = await confirm({ title: "Delete?", message: "This cannot be undone.", variant: "danger" });
//   if (ok) handleDelete();
// =======================================================

function ConfirmDialog() {
  const { confirmState, handleConfirmResolve } = useUI();
  const { open, title, message, confirmLabel, cancelLabel, variant } = confirmState;

  const cancelBtnRef = useRef(null);

  // Trap focus on open — auto-focus cancel (safe default)
  useEffect(() => {
    if (open && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleConfirmResolve(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleConfirmResolve]);

  if (!open) return null;

  const variantClass = variant === "danger"  ? "confirm-dialog-confirm--danger"
                     : variant === "warning" ? "confirm-dialog-confirm--warning"
                     : "confirm-dialog-confirm--default";

  return (
    <div
      className="confirm-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={() => handleConfirmResolve(false)}
    >
      <div
        className="confirm-dialog-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          {variant === "danger" && (
            <span className="confirm-dialog-icon confirm-dialog-icon--danger" aria-hidden="true">⚠</span>
          )}
          {variant === "warning" && (
            <span className="confirm-dialog-icon confirm-dialog-icon--warning" aria-hidden="true">⚠</span>
          )}
          <h2 id="confirm-dialog-title" className="confirm-dialog-title">
            {title}
          </h2>
        </div>

        <p id="confirm-dialog-message" className="confirm-dialog-message">
          {message}
        </p>

        <div className="confirm-dialog-actions">
          <button
            ref={cancelBtnRef}
            className="confirm-dialog-cancel"
            onClick={() => handleConfirmResolve(false)}
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-dialog-confirm ${variantClass}`}
            onClick={() => handleConfirmResolve(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ConfirmDialog);
