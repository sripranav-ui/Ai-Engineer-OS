import ProjectCard from "./ProjectCard";

function ProjectKanban({ projects, onProjectSelect }) {
  // Helpers to get list by column status
  const getColStatus = (project) => {
    return project.kanbanStatus ||
      (project.completed ? "Completed" : (project.status === "Unlocked" ? "In Progress" : "Not Started"));
  };

  const notStarted = projects.filter((p) => getColStatus(p) === "Not Started");
  const inProgress = projects.filter((p) => getColStatus(p) === "In Progress");
  const completed = projects.filter((p) => getColStatus(p) === "Completed");

  const columns = [
    { title: "🔒 Not Started", count: notStarted.length, cards: notStarted, color: "#64748b" },
    { title: "⚡ In Progress", count: inProgress.length, cards: inProgress, color: "#3b82f6" },
    { title: "✅ Completed", count: completed.length, cards: completed, color: "#10b981" },
  ];

  return (
    <div className="kanban-board">
      {columns.map((col) => (
        <div key={col.title} className="kanban-column">
          <div className="kanban-column-header">
            <h3 className="kanban-column-title">{col.title}</h3>
            <span
              style={{
                fontSize: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "2px 8px",
                borderRadius: "20px",
                color: col.color,
                fontWeight: "700",
              }}
            >
              {col.count}
            </span>
          </div>
          <div className="kanban-cards-stack">
            {col.cards.length > 0 ? (
              col.cards.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => onProjectSelect(project)}
                />
              ))
            ) : (
              <p
                style={{
                  color: "#475569",
                  textAlign: "center",
                  fontSize: "13px",
                  padding: "30px 0",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                Empty Column
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectKanban;
