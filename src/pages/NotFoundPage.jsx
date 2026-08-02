import React from "react";
import { useNavigate } from "react-router-dom";
import ErrorState from "../components/Common/ErrorState";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";

// =======================================================
// NotFoundPage.jsx — 404 Status Page
// =======================================================

function NotFoundPage() {
  const navigate = useNavigate();
  useDocumentMetadata("Page Not Found", "The requested workspace node could not be resolved.");

  return (
    <div className="status-page fade-in">
      <ErrorState
        title="404 — Node Unresolved"
        message="The workspace node you are looking for does not exist, has been shifted, or is currently under maintenance."
        onRetry={() => navigate("/")}
        actionLabel="Return to Workspace →"
      />
    </div>
  );
}

export default React.memo(NotFoundPage);
