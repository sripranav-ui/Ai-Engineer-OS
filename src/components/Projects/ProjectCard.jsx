import Card from "../Common/Card";
import Button from "../Common/Button";
import Badge from "../Common/Badge";
import ProgressBar from "../Common/ProgressBar";

function ProjectCard({ project, onClick }) {
  // Pre-fill defaults if not in data
  const github = project.githubUrl || `https://github.com/pranav/${project.title.toLowerCase().replace(/\s+/g, "-")}`;
  const liveDemo = project.liveUrl || `https://${project.title.toLowerCase().replace(/\s+/g, "-")}.vercel.app`;
  const progressPercent = project.progressPercent !== undefined
    ? project.progressPercent
    : (project.completed ? 100 : (project.status === "Unlocked" ? 35 : 0));

  const kanbanStatus = project.kanbanStatus ||
    (project.completed ? "Completed" : (project.status === "Unlocked" ? "In Progress" : "Not Started"));

  let statusType = "outline";
  if (kanbanStatus === "Completed") statusType = "success";
  if (kanbanStatus === "In Progress") statusType = "primary";

  return (
    <Card
      className="project-card"
      style={{
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={onClick}
    >
      {/* Title & Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ margin: 0, color: "#ffffff", fontSize: "18px", fontWeight: "700" }}>
          {project.title}
        </h3>
        <Badge type={statusType}>
          {kanbanStatus === "Completed" ? "✓ Completed" : kanbanStatus === "In Progress" ? "⚡ In Progress" : "🔒 Not Started"}
        </Badge>
      </div>

      {/* Meta row: Difficulty & Duration */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Badge type={project.difficulty === "Easy" ? "success" : "warning"}>
          {project.difficulty}
        </Badge>
        <Badge type="outline">
          ⏱️ {project.duration}
        </Badge>
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
          {progressPercent}% Complete
        </span>
      </div>

      {/* Description */}
      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
        {project.description}
      </p>

      {/* Tech Stack / Skills Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {(project.skills || []).map((skill) => (
          <Badge key={skill} type="outline" style={{ fontSize: "11px", opacity: 0.8 }}>
            {skill}
          </Badge>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: "5px" }}>
        <ProgressBar progress={progressPercent} label="" showValue={false} />
      </div>

      {/* Footer controls: links and actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "12px",
          marginTop: "5px",
        }}
        onClick={(e) => e.stopPropagation()} // Stop modal from triggering when clicking links/buttons
      >
        <div style={{ display: "flex", gap: "12px" }}>
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "#60a5fa", fontSize: "13px", fontWeight: "600" }}
          >
            🔗 GitHub
          </a>
          <a
            href={liveDemo}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "#10b981", fontSize: "13px", fontWeight: "600" }}
          >
            🚀 Live Demo
          </a>
        </div>
        <Button onClick={onClick} type="outline">
          Details
        </Button>
      </div>
    </Card>
  );
}

export default ProjectCard;