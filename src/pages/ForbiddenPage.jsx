import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Common/Button";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// ForbiddenPage.jsx — 403 Status Page
// =======================================================

export function ForbiddenPage() {
  const navigate = useNavigate();
  useDocumentMetadata("Access Forbidden", "Access restricted due to insufficient permissions.");

  return (
    <div className="status-page fade-in">
      <span className="status-page-icon">🚫</span>
      <h1>403 — Access Forbidden</h1>
      <p>
        Your account does not hold the required security clearance to access this workspace segment.
      </p>
      <Button onClick={() => navigate("/")} type="primary">
        Return to Workspace
      </Button>
    </div>
  );
}

export default ForbiddenPage;
