import React, { useState, useContext, useMemo } from "react";
import AppContext from "../context/AppContext";
import { CareerContext } from "../context/CareerContext";
import { GamificationContext } from "../context/GamificationContext";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import ProgressBar from "../components/Common/ProgressBar";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// PortfolioHubPage.jsx
// Professional Portfolio & Career Hub with HTML Exporter
// =======================================================

function PortfolioHubPage() {
  useDocumentMetadata("Portfolio Hub", "Unifies job readiness scores, skills matrices, mock GitHub/LinkedIn profile connections, and HTML website exporters.");

  const { projects } = useContext(AppContext);
  const { appliedJobs, resumes, interviews } = useContext(CareerContext);
  const { achievements } = useContext(GamificationContext);
  const { user } = useContext(AuthContext);

  // Connection states
  const [gitConnected, setGitConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);

  // Job readiness computations
  const readinessScore = useMemo(() => {
    let score = 25; // Base profile score
    if (resumes && resumes.length > 0) score += 20;
    if (projects && projects.some((p) => p.completed)) score += 20;
    if (appliedJobs && appliedJobs.length > 0) score += 15;
    if (interviews && interviews.length > 0) score += 10;
    if (achievements && achievements.length > 0) score += 10;
    return Math.min(score, 100);
  }, [resumes, projects, appliedJobs, interviews, achievements]);

  // Skill matrix parameters
  const skillsList = [
    { name: "Python Basics & Closures", category: "Languages", level: 90 },
    { name: "SQL Window Functions & JOINS", category: "Languages", level: 80 },
    { name: "Classical Machine Learning", category: "ML/DL", level: 85 },
    { name: "PyTorch & Deep Learning Matrices", category: "ML/DL", level: 75 },
    { name: "Transformers & Attention Scores", category: "NLP/CV", level: 70 },
    { name: "Docker Containerization", category: "Infrastructure", level: 80 },
    { name: "GitHub Workflows CI/CD", category: "Infrastructure", level: 75 },
    { name: "Horizontal Database Scaling", category: "System Design", level: 65 }
  ];

  // Self-contained dynamic HTML portfolio site generator
  const exportPortfolioWebsite = () => {
    const skillsHtml = skillsList
      .map((s) => `
        <div class="skill-card">
          <div class="skill-header">
            <strong>${s.name}</strong>
            <span>${s.level}%</span>
          </div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${s.level}%"></div>
          </div>
        </div>
      `)
      .join("");

    const projectsHtml = (projects || [])
      .map((p) => `
        <div class="project-card">
          <h4>${p.title}</h4>
          <p class="difficulty">Difficulty: ${p.difficulty}</p>
          <p>${p.description || "Interactive portfolio application built using advanced React blueprints."}</p>
          <div class="project-tags">
            <span class="tag">${p.difficulty}</span>
            <span class="tag">${p.completed ? "✓ Completed" : "In Progress"}</span>
          </div>
        </div>
      `)
      .join("");

    const achievementsHtml = (achievements || [])
      .map((a) => `
        <div class="achievement-badge">
          <span>🏆</span>
          <div>
            <strong>${a.title}</strong>
            <p>${a.desc}</p>
          </div>
        </div>
      `)
      .join("");

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${user?.name || "Developer"} | Professional AI Portfolio</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0b0f19;
      color: #cbd5e1;
      margin: 0;
      padding: 0;
    }
    header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 60px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    header h1 {
      color: #ffffff;
      margin: 0 0 10px;
      font-size: 36px;
    }
    header p {
      color: #60a5fa;
      font-size: 18px;
      margin: 0;
    }
    .container {
      max-width: 960px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h2 {
      color: #ffffff;
      border-bottom: 2px solid rgba(96,165,250,0.2);
      padding-bottom: 8px;
      margin-top: 40px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .skill-card, .project-card, .achievement-badge {
      background: #1e293b;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .skill-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .bar-container {
      background: #334155;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      background: #60a5fa;
      height: 100%;
    }
    .project-card h4 {
      margin: 0 0 8px;
      color: #ffffff;
    }
    .project-card p {
      font-size: 13px;
      line-height: 1.5;
    }
    .difficulty {
      font-size: 11px;
      color: #60a5fa;
      margin: 0 0 10px;
    }
    .project-tags {
      display: flex;
      gap: 6px;
      margin-top: 12px;
    }
    .tag {
      font-size: 10px;
      background: rgba(255,255,255,0.05);
      padding: 2px 6px;
      border-radius: 4px;
      color: #94a3b8;
    }
    .achievement-badge {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .achievement-badge span {
      font-size: 32px;
    }
    .achievement-badge p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #94a3b8;
    }
    footer {
      text-align: center;
      padding: 40px;
      color: #64748b;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <header>
    <h1>${user?.name || "Developer"}</h1>
    <p>Professional AI & Machine Learning Systems Specialist</p>
  </header>
  <div class="container">
    <h2>🛠️ Skills Matrix</h2>
    <div class="grid">${skillsHtml}</div>

    <h2>🚀 Featured Projects Showcase</h2>
    <div class="grid">${projectsHtml}</div>

    <h2>🏆 Unlocked Achievements</h2>
    <div class="grid">${achievementsHtml}</div>
  </div>
  <footer>
    Generated in AI Engineer OS Workspace. Ready for deployment.
  </footer>
</body>
</html>`;

    // Download Blob file trigger
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portfolio.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content fade-in" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      
      {/* Dynamic Header */}
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-default)", paddingBottom: "15px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 style={{ fontSize: "26px", color: "var(--text-primary)", margin: "0 0 5px", fontWeight: "800" }}>
            💼 Professional Portfolio Hub
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
            Compile certifications, skills mapping, and export self-contained portfolio websites
          </p>
        </div>
        <Button onClick={exportPortfolioWebsite} type="success" style={{ padding: "10px 20px" }}>
          ⚡ Generate & Export Website (HTML)
        </Button>
      </div>

      <div className="custom-widgets-grid">
        
        {/* Readiness speedometer block (Span 1) */}
        <div className="widget-span-narrow">
          <Card title="🚀 Job Readiness Score" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0" }}>
              
              {/* Circular gauge SVG dial layout */}
              <div style={{ position: "relative", width: "120px", height: "120px" }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-default)" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="8"
                    strokeDasharray={314.16}
                    strokeDashoffset={314.16 - (314.16 * readinessScore) / 100}
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "24px", color: "var(--text-primary)", fontWeight: "800" }}>
                  {readinessScore}%
                </div>
              </div>

              <span style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "15px", textAlign: "center" }}>
                {readinessScore >= 80
                  ? "🔥 Job Readiness: Excellent! Ready to apply."
                  : readinessScore >= 50
                  ? "👍 Core credentials ready. Add more projects."
                  : "⬜ Complete your profile parameters."}
              </span>
            </div>
            
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px", fontSize: "11px", color: "#64748b" }}>
              Complete resume versions, portfolio projects, and mock sessions to optimize matches score.
            </div>
          </Card>
        </div>

        {/* Integration connections blocks (Span 2) */}
        <div className="widget-span-wide">
          <Card title="🔗 Workspace Integration Modules" style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* GitHub integration card */}
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <strong style={{ fontSize: "14px", color: "var(--text-primary)", display: "block" }}>🐙 GitHub Account Integration</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {gitConnected ? "✅ Connected as @pranav (18 Repos, 14 commits today)" : "Not connected to GitHub repositories profiles."}
                  </span>
                </div>
                <Button onClick={() => setGitConnected(!gitConnected)} type={gitConnected ? "outline" : "primary"} style={{ padding: "6px 14px", fontSize: "11px" }}>
                  {gitConnected ? "Disconnect" : "Connect Profile"}
                </Button>
              </div>

              {/* LinkedIn integration card */}
              <div style={{ padding: "16px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <strong style={{ fontSize: "14px", color: "var(--text-primary)", display: "block" }}>💼 LinkedIn Professional Profile</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {linkedinConnected ? "✅ Connected as Pranav (480+ connections, Top 5% match rank)" : "Not connected to professional directory links."}
                  </span>
                </div>
                <Button onClick={() => setLinkedinConnected(!linkedinConnected)} type={linkedinConnected ? "outline" : "primary"} style={{ padding: "6px 14px", fontSize: "11px" }}>
                  {linkedinConnected ? "Disconnect" : "Connect profile"}
                </Button>
              </div>

            </div>
          </Card>
        </div>

        {/* Skills matrix grid (Span 3) */}
        <div className="widget-span-full">
          <Card title="🛠️ AI Engineering Skills Matrix">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              {skillsList.map((s, idx) => (
                <div key={idx} style={{ padding: "12px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{s.name}</strong>
                    <Badge type="primary" style={{ fontSize: "9px" }}>{s.category}</Badge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span>Skill Rank</span>
                    <strong>{s.level}%</strong>
                  </div>
                  <ProgressBar progress={s.level} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Project list showcase (Span 2) */}
        <div className="widget-span-wide">
          <Card title="🚀 Portfolio Featured Projects Showcase" style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {projects && projects.length > 0 ? (
                projects.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "8px" }}>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--text-primary)", display: "block" }}>{p.title}</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Category level: {p.difficulty}</span>
                    </div>
                    <Badge type={p.completed ? "success" : "warning"}>
                      {p.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>No projects configured inside active projects boards.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Achievements Timeline gallery (Span 1) */}
        <div className="widget-span-narrow">
          <Card title="🏆 Earned Credentials" style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
              {achievements && achievements.length > 0 ? (
                achievements.map((a) => (
                  <div key={a.id} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "20px" }}>🏆</span>
                    <div>
                      <strong style={{ fontSize: "12px", color: "#ffffff", display: "block" }}>{a.title}</strong>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{a.desc}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>Unlocks badges by claiming daily streaks and completing lessons.</div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default React.memo(PortfolioHubPage);
