// =======================================================
// LessonProgress.jsx
// Displays today's lesson progress
// =======================================================

function LessonProgress({ completed, total }) {
  // ==========================================
  // Calculate Percentage
  // ==========================================
  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        marginTop: "25px",
        boxShadow: "0 5px 15px rgba(0,0,0,.1)",
        color: "#111827",
      }}
    >
      <h2>📊 Today's Progress</h2>

      <div
        style={{
          background: "#e5e7eb",
          borderRadius: "10px",
          overflow: "hidden",
          height: "20px",
          marginTop: "15px",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#2563eb",
            transition: "0.4s",
          }}
        ></div>
      </div>

      <p style={{ marginTop: "15px" }}>
        {completed} / {total} Tasks Completed
      </p>

      <h3>{percentage}% Completed</h3>
    </div>
  );
}

export default LessonProgress;