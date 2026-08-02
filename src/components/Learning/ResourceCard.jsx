// =======================================================
// ResourceCard.jsx
// Displays all learning resources
// =======================================================

import Card from "../Common/Card";
import Button from "../Common/Button";

function ResourceCard({
  notes,
  video,
  practice,
  cheatsheet,
}) {
  return (
    <Card className="resource-card" style={{ marginTop: "25px" }}>
      <h2>📚 Learning Resources</h2>

      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "#ffffff", marginBottom: "10px", fontSize: "1.1rem" }}>
          📝 Notes
        </h3>
        <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
          {notes}
        </p>
      </div>

      <hr style={{ margin: "25px 0", borderColor: "rgba(255, 255, 255, 0.08)" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <div>
          <h3 style={{ color: "#ffffff", marginBottom: "12px", fontSize: "1.1rem" }}>
            🎥 Video Tutorial
          </h3>
          <a href={video} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button type="outline">
              ▶ Watch Video
            </Button>
          </a>
        </div>

        <div>
          <h3 style={{ color: "#ffffff", marginBottom: "12px", fontSize: "1.1rem" }}>
            💻 Practice Problems
          </h3>
          <a href={practice} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button type="outline">
              Solve Problems
            </Button>
          </a>
        </div>

        <div>
          <h3 style={{ color: "#ffffff", marginBottom: "12px", fontSize: "1.1rem" }}>
            📄 Cheat Sheet
          </h3>
          <a href={cheatsheet} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button type="outline">
              Open Cheat Sheet
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}

export default ResourceCard;