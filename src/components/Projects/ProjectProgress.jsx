// =======================================================
// ProjectProgress.jsx
// Displays project completion progress
// =======================================================

import ProgressBar from "../Common/ProgressBar";

function ProjectProgress({
  completed,
  total,
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  return (
    <div
      style={{
        marginBottom: "30px",
      }}
    >
      <ProgressBar
        progress={percentage}
        label="📊 Project Progress"
        showValue={true}
      />

      <p style={{ marginTop: "10px", color: "#94a3b8", fontSize: "14px" }}>
        {completed} / {total} Projects Completed
      </p>
    </div>
  );
}

export default ProjectProgress;