import RoadmapCard from "./RoadmapCard";

function RoadmapTimeline({ roadmap, onComplete, currentDay }) {
  return (
    <div
      className="timeline-container"
      style={{
        position: "relative",
        marginTop: "30px",
        paddingLeft: "45px",
      }}
    >
      {/* Vertical connector line */}
      <div
        style={{
          position: "absolute",
          left: "20px",
          top: "10px",
          bottom: "10px",
          width: "2px",
          background: "rgba(255, 255, 255, 0.08)",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {roadmap.map((day) => {
          const isCompleted = day.completed;
          const isCurrent = day.id === currentDay;

          let nodeBg = "#1e293b";
          let nodeBorder = "2px solid #475569";
          let nodeGlow = "none";

          if (isCompleted) {
            nodeBg = "#10b981";
            nodeBorder = "2px solid #10b981";
          } else if (isCurrent) {
            nodeBg = "#3b82f6";
            nodeBorder = "2px solid #3b82f6";
            nodeGlow = "0 0 8px 3px rgba(59, 130, 246, 0.4)";
          }

          return (
            <div key={day.id} style={{ position: "relative" }}>
              {/* Timeline Node dot */}
              <div
                style={{
                  position: "absolute",
                  left: "-35px",
                  top: "24px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: nodeBg,
                  border: nodeBorder,
                  boxShadow: nodeGlow,
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                  transition: "all 0.3s ease",
                }}
              />

              <RoadmapCard
                day={day}
                onComplete={onComplete}
                currentDay={currentDay}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoadmapTimeline;
