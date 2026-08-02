import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import { GamificationContext } from "../context/GamificationContext";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import ProgressBar from "../components/Common/ProgressBar";
import useDocumentMetadata from "../hooks/useDocumentMetadata";
import {
  FaSearch,
  FaPlay,
  FaPause,
  FaRedo,
  FaRocket,
  FaBookOpen,
  FaFire,
  FaClock,
  FaGithub,
  FaBug,
  FaLightbulb,
  FaMapMarkedAlt,
  FaRegFileAlt,
} from "react-icons/fa";
import "../styles/pages/workspace.css";

// =======================================================
// WorkspacePage.jsx — Studio Operating System Workspace
// Cursor + Linear + Raycast Unified Developer Workspace
// 100% Preserved Logic, Hooks & React State
// =======================================================

function WorkspacePage() {
  const navigate = useNavigate();
  useDocumentMetadata(
    "Home Workspace",
    "Daily home console for managing tasks, Pomodoro sessions, ongoing projects, and AI assistant query modules."
  );

  const { roadmap, projects, checkDay } = useContext(AppContext);
  const { streak, xp } = useContext(GamificationContext);
  const { user } = useContext(AuthContext);

  // --- Pomodoro Timer State ---
  const [pomoSecs, setPomoSecs] = useState(1500); // 25:00
  const [pomoActive, setPomoActive] = useState(false);

  useEffect(() => {
    let timer = null;
    if (pomoActive && pomoSecs > 0) {
      timer = setInterval(() => {
        setPomoSecs((prev) => prev - 1);
      }, 1000);
    } else if (pomoSecs === 0) {
      setPomoActive(false);
      alert("⏱️ Pomodoro finished! Take a well-earned break.");
      setPomoSecs(1500);
    }
    return () => clearInterval(timer);
  }, [pomoActive, pomoSecs]);

  const formatPomoTime = () => {
    const mins = Math.floor(pomoSecs / 60);
    const secs = pomoSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- AI Console Input State ---
  const [aiPrompt, setAiPrompt] = useState("");
  const handleAiAction = (actionType) => {
    let query = "";
    if (actionType === "explain") {
      query = "Explain this Python code block for me: \n";
    } else if (actionType === "debug") {
      query = "Help me debug this error message: \n";
    } else if (actionType === "roadmap") {
      query = "Generate an optimized study roadmap for learning: ";
    } else {
      query = aiPrompt;
    }
    localStorage.setItem(
      "pending_ai_assistant_query",
      query + (actionType === "ask" ? aiPrompt : "")
    );
    navigate("/assistant");
  };

  // Memoized lists
  const todayLesson = roadmap.find((r) => !r.completed) || roadmap[0];
  const activeProj = projects.find((p) => !p.completed) || projects[0];

  return (
    <div className="workspace-shell">
      {/* ─── Studio Workspace Header ─── */}
      <div className="workspace-header">
        <div>
          <h1 className="workspace-greeting-title">
            Welcome back, {user?.name || "Developer"}
          </h1>
          <div className="workspace-greeting-meta">
            <Badge type="accent">Level {user?.level || 1} Engineer</Badge>
            <span>•</span>
            <span>
              Total XP: <strong>{xp}</strong>
            </span>
          </div>
        </div>
        <div className="workspace-header-actions">
          <Button onClick={() => navigate("/")} type="outline" className="btn-sm">
            Stats Dashboard
          </Button>
          <Button onClick={() => navigate("/notes")} type="primary" className="btn-sm">
            <FaRegFileAlt /> Notes Manager
          </Button>
        </div>
      </div>

      {/* ─── Raycast-Style AI Command Launcher Bar ─── */}
      <div className="workspace-command-bar">
        <div className="command-input-wrapper">
          <FaSearch className="command-search-icon" />
          <input
            type="text"
            className="command-input"
            placeholder="Ask AI Copilot, search code snippets, or run workspace actions..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAiAction("ask");
            }}
          />
          <span className="command-shortcut-hint">⌘K</span>
          <Button onClick={() => handleAiAction("ask")} type="primary" className="btn-sm">
            Query Agent
          </Button>
        </div>

        <div className="command-quick-actions">
          <Button
            onClick={() => handleAiAction("explain")}
            type="ghost"
            className="btn-xs"
          >
            <FaLightbulb /> Explain Code
          </Button>
          <Button
            onClick={() => handleAiAction("debug")}
            type="ghost"
            className="btn-xs"
          >
            <FaBug /> Debug Error
          </Button>
          <Button
            onClick={() => handleAiAction("roadmap")}
            type="ghost"
            className="btn-xs"
          >
            <FaMapMarkedAlt /> Build Roadmap
          </Button>
        </div>
      </div>

      {/* ─── Asymmetrical 2-Column Desktop Operating System Layout ─── */}
      <div className="workspace-layout-grid">
        {/* ─── PRIMARY WORKSTATION COLUMN (Left - 67%) ─── */}
        <div className="workspace-main-column">
          {/* Active Workspace Project Node */}
          <Card className="card-primary">
            <div className="card-header">
              <div>
                <span className="overline">Active Project Node</span>
                <h3 className="card-title" style={{ marginTop: "4px" }}>
                  {activeProj ? activeProj.title : "No Active Project"}
                </h3>
              </div>
              {activeProj && (
                <Badge type={activeProj.completed ? "success" : "warning"}>
                  {activeProj.completed ? "Completed" : "In Progress"}
                </Badge>
              )}
            </div>

            {activeProj ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                      marginBottom: "6px",
                    }}
                  >
                    <span>Milestone Progress</span>
                    <strong>45%</strong>
                  </div>
                  <ProgressBar progress={45} />
                </div>

                <div>
                  <span className="overline" style={{ display: "block", marginBottom: "8px" }}>
                    Next Milestones
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div className="task-item-row">
                      <input type="checkbox" readOnly />
                      <span>Complete core module implementation</span>
                    </div>
                    <div className="task-item-row">
                      <input type="checkbox" readOnly />
                      <span>Design interactive unit test suite</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer" style={{ marginTop: "8px", paddingTop: "12px" }}>
                  <Button onClick={() => navigate("/projects")} type="primary" className="btn-sm">
                    <FaRocket /> Open Kanban Board
                  </Button>
                  <a href="https://github.com" target="_blank" rel="noreferrer">
                    <Button type="outline" className="btn-sm">
                      <FaGithub /> GitHub Repo
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <p className="body-text">No active project started yet.</p>
            )}
          </Card>

          {/* Today's Focus & Study Module */}
          <Card>
            <div className="card-header">
              <div>
                <span className="overline">Daily Action Items</span>
                <h3 className="card-title" style={{ marginTop: "4px" }}>
                  Today's Engineering Plan
                </h3>
              </div>
            </div>

            <div className="workspace-quote-banner">
              💬 <em>"The only way to write fast code is to write clean code first."</em>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
              <div>
                <span className="overline" style={{ display: "block", marginBottom: "8px" }}>
                  Core Today Lesson
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "var(--surface-2)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: "14px" }}>
                      Day {todayLesson?.id}: {todayLesson?.topic}
                    </h4>
                    <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      Recommended study: 45 mins
                    </span>
                  </div>
                  <Button onClick={() => navigate("/learning")} type="primary" className="btn-sm">
                    <FaBookOpen /> Study
                  </Button>
                </div>
              </div>

              <div>
                <span className="overline" style={{ display: "block", marginBottom: "8px" }}>
                  Today's Tasks Checklist
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {roadmap.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => checkDay(item.id)}
                      className={`task-item-row ${item.completed ? "completed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                      />
                      <span>
                        Complete Day {item.id} learning exercises
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Continue Curriculum Grid */}
          <Card>
            <span className="overline" style={{ display: "block", marginBottom: "12px" }}>
              Curriculum Pipeline
            </span>
            <div className="curriculum-grid">
              <div className="curriculum-card">
                <div>
                  <Badge type="accent">Resume Last Lesson</Badge>
                  <h4 style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                    Day 4: Python Dictionary Methods
                  </h4>
                </div>
                <Button
                  onClick={() => navigate("/learning")}
                  type="primary"
                  className="btn-xs"
                  style={{ alignSelf: "flex-start", marginTop: "12px" }}
                >
                  Resume →
                </Button>
              </div>

              <div className="curriculum-card">
                <div>
                  <Badge type="info">Recently Viewed</Badge>
                  <h4 style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                    Day 3: Control Flows & Loops
                  </h4>
                </div>
                <Button
                  onClick={() => navigate("/learning")}
                  type="outline"
                  className="btn-xs"
                  style={{ alignSelf: "flex-start", marginTop: "12px" }}
                >
                  Review
                </Button>
              </div>

              <div className="curriculum-card">
                <div>
                  <Badge type="success">Recommended</Badge>
                  <h4 style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                    Day 5: Error Handling in Try-Except
                  </h4>
                </div>
                <Button
                  onClick={() => navigate("/learning")}
                  type="outline"
                  className="btn-xs"
                  style={{ alignSelf: "flex-start", marginTop: "12px" }}
                >
                  Start
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── FOCUS COMMAND RAIL (Right Column - 33%) ─── */}
        <div className="workspace-side-column">
          {/* Pomodoro Studio Controller */}
          <div className="pomo-studio-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="overline">Focus Pomodoro Studio</span>
              <FaClock style={{ color: "var(--accent)" }} />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div className="pomo-timer-display">{formatPomoTime()}</div>
              <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>25 min cycle</span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                onClick={() => setPomoActive(!pomoActive)}
                type="primary"
                className="btn-sm"
                style={{ flex: 1 }}
              >
                {pomoActive ? <><FaPause /> Pause</> : <><FaPlay /> Start</>}
              </Button>
              <Button
                onClick={() => {
                  setPomoActive(false);
                  setPomoSecs(1500);
                }}
                type="outline"
                className="btn-sm"
              >
                <FaRedo /> Reset
              </Button>
            </div>
          </div>

          {/* Productivity & Commit Metrics */}
          <Card>
            <span className="overline" style={{ display: "block", marginBottom: "12px" }}>
              Focus Metrics
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  <FaFire style={{ color: "var(--warning)" }} /> Current Streak
                </span>
                <strong>{streak || 1} Days</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Daily XP Gained
                </span>
                <strong style={{ color: "var(--accent)" }}>+120 XP</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Study Hours Today
                </span>
                <strong style={{ color: "var(--success)" }}>2.5 Hrs</strong>
              </div>

              <div style={{ marginTop: "8px" }}>
                <span className="overline" style={{ display: "block", marginBottom: "8px" }}>
                  Weekly Commit Hours
                </span>
                <div className="commit-graph-container">
                  {[2.5, 4.0, 1.2, 3.5, 2.0, 0, 0].map((hrs, idx) => (
                    <div key={idx} className="commit-col">
                      <div
                        className="commit-bar"
                        style={{ height: `${hrs * 12}px` }}
                      />
                      <span className="commit-day-label">
                        {["M", "T", "W", "T", "F", "S", "S"][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Target Deadlines Card */}
          <Card>
            <span className="overline" style={{ display: "block", marginBottom: "12px" }}>
              Target Deadlines
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="overline" style={{ color: "var(--danger)" }}>
                    Day 7 Target
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-ghost)" }}>2 days</span>
                </div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  API Integrations
                </strong>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="overline" style={{ color: "var(--warning)" }}>
                    Resume Draft
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-ghost)" }}>4 days</span>
                </div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  Submit draft copy
                </strong>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="overline" style={{ color: "var(--success)" }}>
                    Certificate Target
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-ghost)" }}>7 days</span>
                </div>
                <strong style={{ fontSize: "13px", color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  Unlock Quest Rewards
                </strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default React.memo(WorkspacePage);
