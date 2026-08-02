import Badge from "../Common/Badge";

function LessonHeader({ title, difficulty, duration = "2 Hours", completed }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        paddingBottom: "20px",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "15px"
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "700", color: "#ffffff" }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Badge type={difficulty === "Easy" || difficulty === "Beginner" ? "success" : "warning"}>
          {difficulty}
        </Badge>
        <Badge type="outline">
          ⏱️ {duration}
        </Badge>
        <Badge type={completed ? "success" : "danger"}>
          {completed ? "✅ Completed" : "⏳ In Progress"}
        </Badge>
      </div>
    </div>
  );
}

export default LessonHeader;
