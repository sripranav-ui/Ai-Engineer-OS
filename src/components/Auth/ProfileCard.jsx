import React, { useContext, useMemo } from "react";
import AppContext from "../../context/AppContext";
import Avatar from "../Common/Avatar";
import Card from "../Common/Card";
import Badge from "../Common/Badge";

// =======================================================
// ProfileCard.jsx
// Displays active user summary and learning achievements
// =======================================================

function ProfileCard({ user }) {
  const { roadmap, projects } = useContext(AppContext);

  // Computations
  const completedLessons = useMemo(() => {
    return roadmap.filter((day) => day.completed).length;
  }, [roadmap]);

  const completedProjects = useMemo(() => {
    return projects.filter((p) => p.completed).length;
  }, [projects]);

  const progressPercent = useMemo(() => {
    return roadmap.length === 0 ? 0 : Math.round((completedLessons / roadmap.length) * 100);
  }, [roadmap.length, completedLessons]);

  const joinedDate = user?.joinedDate || "July 2026";
  const bioText = user?.bio || "AI Engineering student";

  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "30px 20px",
        gap: "20px",
        height: "100%",
      }}
    >
      {/* User Avatar */}
      <Avatar src={user?.avatarUrl} alt={user?.name} size="lg" />

      {/* User Info Details */}
      <div>
        <h2 style={{ margin: 0, fontSize: "20px", color: "#ffffff", fontWeight: "700" }}>
          {user?.name}
        </h2>
        <span style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600", display: "block", marginTop: "4px" }}>
          🚀 AI Engineer Candidate
        </span>
        <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginTop: "2px" }}>
          {user?.email}
        </span>
      </div>

      {/* User Bio Description */}
      <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", fontStyle: "italic" }}>
        "{bioText}"
      </p>

      {/* Verified Achievements & Stats */}
      <div className="profile-info-grid" style={{ width: "100%", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "20px" }}>
        <div className="profile-info-row">
          <span className="profile-info-label">Member Since</span>
          <span className="profile-info-val">{joinedDate}</span>
        </div>
        
        <div className="profile-info-row">
          <span className="profile-info-label">Roadmap Days</span>
          <span className="profile-info-val">
            <Badge type="primary">{completedLessons} / {roadmap.length}</Badge>
          </span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">Projects Completed</span>
          <span className="profile-info-val">
            <Badge type="success">{completedProjects} / {projects.length}</Badge>
          </span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">Milestone Progress</span>
          <span className="profile-info-val" style={{ color: "#10b981", fontWeight: "700" }}>
            {progressPercent}%
          </span>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(ProfileCard);
