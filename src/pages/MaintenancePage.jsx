import React from "react";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// MaintenancePage.jsx — System Maintenance Status
// =======================================================

export function MaintenancePage() {
  useDocumentMetadata("System Maintenance", "Platform is undergoing scheduled upgrades.");

  return (
    <div className="status-page fade-in">
      <span className="status-page-icon">⚙️</span>
      <h1>System Maintenance</h1>
      <p>
        We are upgrading backend clusters and refreshing system infrastructure.
        Normal operations will resume shortly.
      </p>
    </div>
  );
}

export default MaintenancePage;
