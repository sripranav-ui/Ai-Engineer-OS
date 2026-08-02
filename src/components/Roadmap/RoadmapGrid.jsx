import RoadmapCard from "./RoadmapCard";

function RoadmapGrid({ roadmap, onComplete, currentDay }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {roadmap.map((day) => (
        <RoadmapCard
          key={day.id}
          day={day}
          onComplete={onComplete}
          currentDay={currentDay}
        />
      ))}
    </div>
  );
}

export default RoadmapGrid;
