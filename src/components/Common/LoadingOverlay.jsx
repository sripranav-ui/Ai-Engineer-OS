import React from "react";
import { useUI } from "../../context/UIContext";

// =======================================================
// LoadingOverlay.jsx — Global Full-Screen Loading State
// =======================================================
// Activated via UIContext.showLoading() / hideLoading().
// Sits at z-index overlay, above all content.
//
// Usage:
//   const { showLoading, hideLoading } = useUI();
//   showLoading("Saving changes…");
//   await save();
//   hideLoading();
// =======================================================

function LoadingOverlay() {
  const { loadingState } = useUI();

  if (!loadingState.active) return null;

  return (
    <div
      className="loading-overlay"
      role="status"
      aria-live="polite"
      aria-label={loadingState.message || "Loading"}
    >
      <div className="loading-overlay-content">
        <div className="loading-overlay-spinner" aria-hidden="true">
          <span className="loading-overlay-ring" />
          <span className="loading-overlay-ring loading-overlay-ring--delay" />
        </div>
        {loadingState.message && (
          <span className="loading-overlay-message">{loadingState.message}</span>
        )}
      </div>
    </div>
  );
}

export default React.memo(LoadingOverlay);
