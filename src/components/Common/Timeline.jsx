import React from "react";
import Badge from "./Badge";

/**
 * Reusable Timeline Component
 * @param {Array} items: List of nodes containing { title, subtitle, duration, details, status }
 */
function Timeline({ items }) {
  return (
    <div className="vertical-timeline" style={{ margin: "20px 0" }}>
      {items.map((node, index) => (
        <div key={index} className={`timeline-node ${node.status || "locked"}`}>
          <div className="timeline-node-bullet" />
          
          <div className="timeline-node-header">
            <span className="timeline-node-title">{node.title}</span>
            {node.duration && (
              <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700" }}>{node.duration}</span>
            )}
          </div>

          {node.subtitle && (
            <p style={{ color: "var(--light-text)", fontSize: "12px", margin: "2px 0 6px 0" }}>{node.subtitle}</p>
          )}

          {node.details && (
            <p style={{ color: "white", fontSize: "12.5px", margin: "4px 0" }}>{node.details}</p>
          )}

          {node.tags && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
              {node.tags.map((sk) => (
                <span key={sk} style={{ fontSize: "9.5px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)", padding: "1px 5px", borderRadius: "4px" }}>
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default React.memo(Timeline);
