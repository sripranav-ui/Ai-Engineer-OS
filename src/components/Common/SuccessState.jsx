import React from "react";
import Card from "./Card";
import Button from "./Button";

/**
 * Reusable Success State Component
 */
function SuccessState({ title = "Action Completed Successfully", message, onContinue, actionLabel = "Proceed Session" }) {
  return (
    <Card
      style={{
        padding: "40px",
        textAlign: "center",
        border: "1.5px solid rgba(16, 185, 129, 0.25)",
        background: "rgba(16, 185, 129, 0.02)"
      }}
    >
      <span style={{ fontSize: "44px", display: "block", marginBottom: "15px" }}>🎉</span>
      <h3 style={{ color: "#10b981", fontSize: "18px", margin: "0 0 10px 0", fontWeight: "700" }}>{title}</h3>
      {message && <p style={{ color: "var(--light-text)", fontSize: "13.5px", margin: "0 0 20px 0" }}>{message}</p>}
      
      {onContinue && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={onContinue} type="success" style={{ padding: "8px 20px" }}>
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default React.memo(SuccessState);
