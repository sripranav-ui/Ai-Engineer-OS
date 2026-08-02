import React from "react";

// =======================================================
// DashboardChart.jsx
// Lightweight, responsive SVG-based Column Chart
// =======================================================

function DashboardChart({
  data = [],
  height = 180,
  barColor = "#3b82f6",
}) {
  // Find max value for scaling columns
  const maxVal = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div
      style={{
        width: "100%",
        height: `${height}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginTop: "15px",
      }}
    >
      {/* SVG Container */}
      <div style={{ flex: 1, position: "relative", width: "100%" }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 500 ${height - 20}`}
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          {/* Gradients definitions */}
          <defs>
            <linearGradient id="chart-bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barColor} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Grid lines backdrop (3 lines) */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const yPos = (height - 30) * ratio + 5;
            return (
              <line
                key={idx}
                x1="0%"
                y1={yPos}
                x2="100%"
                y2={yPos}
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Bar columns */}
          {data.map((item, idx) => {
            const xPercent = (idx / (data.length - 1 || 1)) * 90 + 5; // offset margins
            const barHeight = (item.value / maxVal) * (height - 40);
            const yPos = height - 30 - barHeight;

            return (
              <g key={item.label}>
                {/* Column Column Pillar */}
                <rect
                  x={`${xPercent - 2.5}%`}
                  y={yPos}
                  width="5%"
                  height={Math.max(barHeight, 4)}
                  rx="6"
                  ry="6"
                  fill="url(#chart-bar-grad)"
                  style={{
                    transition: "all 0.5s ease-out",
                    cursor: "pointer",
                  }}
                />
                
                {/* Hover value indicators */}
                <text
                  x={`${xPercent}%`}
                  y={yPos - 8}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  style={{ opacity: 0.8 }}
                >
                  {item.value}h
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Grid labels row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 18px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "8px",
        }}
      >
        {data.map((item) => (
          <span
            key={item.label}
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              fontWeight: "600",
              width: "30px",
              textAlign: "center",
            }}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default React.memo(DashboardChart);
