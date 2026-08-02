import React from "react";

/**
 * Reusable Chip Tag Component
 */
function Chip({ label, type = "primary", onDelete }) {
  return (
    <span className={`chip ${type}`}>
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={onDelete}
          className="chip-delete-btn"
          type="button"
          aria-label={`Delete ${label} chip tag`}
        >
          ✕
        </button>
      )}
    </span>
  );
}

export default React.memo(Chip);
