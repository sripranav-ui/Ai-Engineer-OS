import React, { useEffect } from "react";

/**
 * Reusable Toast Notification Item
 */
export function Toast({ message, type = "primary", duration = 3000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast-item ${type}`}>
      <span>
        {type === "success" ? "✔" : type === "warning" ? "⚠" : type === "danger" ? "✖" : "ℹ"}
      </span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "currentColor",
          opacity: 0.6,
          cursor: "pointer",
          marginLeft: "10px",
          padding: 0,
          fontWeight: "bold"
        }}
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Reusable Toasts Fixed Container wrapper
 */
export function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-fixed">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}

export default React.memo(Toast);
