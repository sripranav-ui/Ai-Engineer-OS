import React from "react";
import Card from "./Card";
import ProgressBar from "./ProgressBar";

/**
 * Reusable Progress Card Component
 */
function ProgressCard({ title, label, value, percentage, progressColor = "var(--primary)", style = {} }) {
  return (
    <Card title={title} style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px", marginTop: "10px" }}>
        <span style={{ fontSize: "22px", fontWeight: "800", color: "white" }}>{value}</span>
        <span style={{ fontSize: "12px", color: "var(--light-text)" }}>{label}</span>
      </div>
      <ProgressBar progress={percentage} color={progressColor} />
    </Card>
  );
}

export default React.memo(ProgressCard);
