import React, { useState } from "react";
import Button from "../components/Common/Button";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// OfflinePage.jsx — Disconnected Status
// =======================================================

export function OfflinePage() {
  useDocumentMetadata("Disconnected", "Connection to the network has been lost.");
  const [rechecking, setRechecking] = useState(false);

  const handleRecheck = () => {
    setRechecking(true);
    setTimeout(() => {
      setRechecking(false);
      if (navigator.onLine) {
        window.location.reload();
      } else {
        alert("Still offline. Check your network connection.");
      }
    }, 1000);
  };

  return (
    <div className="status-page fade-in">
      <span className="status-page-icon">📶</span>
      <h1>No Connection</h1>
      <p>
        The system could not establish a connection. The offline queue will record local changes automatically.
      </p>
      <Button onClick={handleRecheck} disabled={rechecking} type="primary">
        {rechecking ? "Checking..." : "Verify Connection"}
      </Button>
    </div>
  );
}

export default OfflinePage;
