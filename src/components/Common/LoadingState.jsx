import React from "react";
import Card from "./Card";

/**
 * Reusable Loading State Skeleton Grid Component
 */
function LoadingState({ cardsCount = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", margin: "20px 0" }}>
      {Array.from({ length: cardsCount }).map((_, idx) => (
        <Card key={idx} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Skeleton Title Row */}
          <div className="skeleton-pulse" style={{ height: "16px", width: "40%", borderRadius: "4px" }} />
          {/* Skeleton Content Bars */}
          <div className="skeleton-pulse" style={{ height: "10px", width: "85%", borderRadius: "2px" }} />
          <div className="skeleton-pulse" style={{ height: "10px", width: "70%", borderRadius: "2px" }} />
          <div className="skeleton-pulse" style={{ height: "10px", width: "90%", borderRadius: "2px" }} />
          {/* Skeleton Action Tag */}
          <div className="skeleton-pulse" style={{ height: "24px", width: "30%", borderRadius: "4px", marginTop: "10px" }} />
        </Card>
      ))}
    </div>
  );
}

export default React.memo(LoadingState);
