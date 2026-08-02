import Card from "../Common/Card";
import Button from "../Common/Button";
import Badge from "../Common/Badge";
import lessonContent from "../../utils/lessonContent";

function RoadmapCard({ day, onComplete, currentDay }) {
  const content = lessonContent[day.id] || { duration: "2 Hours", skills: [] };

  // Status check
  const isCompleted = day.completed;
  const isCurrent = day.id === currentDay;
  const isNext = day.id === currentDay + 1;
  const isLocked = false;

  let pulseClass = "";
  if (isCurrent) {
    pulseClass = "unlocked-pulse";
  }

  return (
    <Card
      className={pulseClass}
      style={{
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "0.05em" }}>
            DAY {day.id}
          </span>
          <h3 style={{ margin: "4px 0 0", color: "#ffffff", fontSize: "18px", fontWeight: "700" }}>
            {day.title}
          </h3>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Badge type={day.difficulty === "Easy" || day.difficulty === "Beginner" ? "success" : "warning"}>
            {day.difficulty}
          </Badge>
          <Badge type="outline">
            ⏱️ {content.duration}
          </Badge>

          {isCompleted && <Badge type="success">✓ Completed</Badge>}
          {isCurrent && <Badge type="primary">⚡ Current Lesson</Badge>}
          {isNext && <Badge type="outline">➡️ Next Lesson</Badge>}
          {isLocked && <Badge type="outline">🔒 Locked</Badge>}
        </div>
      </div>

      {/* Description */}
      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
        {day.description}
      </p>

      {/* Skills Covered */}
      {content.skills && content.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Skills:</span>
          {content.skills.map((skill, idx) => (
            <Badge key={idx} type="outline" style={{ fontSize: "11px", opacity: 0.8 }}>
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Action controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "12px", marginTop: "5px" }}>
        {isCompleted ? (
          <Button disabled type="success">
            ✓ Completed
          </Button>
        ) : (
          <Button onClick={() => onComplete(day.id)} type="success">
            Mark as Complete
          </Button>
        )}
      </div>
    </Card>
  );
}

export default RoadmapCard;