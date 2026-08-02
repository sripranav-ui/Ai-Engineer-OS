import React, { useState, useEffect, useContext } from "react";
import AppContext from "../../context/AppContext";
import { ThemeContext } from "../../context/ThemeContext";
import { NotificationContext } from "../../context/NotificationContext";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import logger from "../../utils/logger";

export function OnboardingWelcomeTour() {
  const appContext = useContext(AppContext);
  
  // Safe extraction of AppContext parameters
  const setProfileName = appContext?.setProfileName || (() => {});
  const globalProfileName = appContext?.profileName || "Guest Developer";

  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Wizard state parameters
  const [username, setUsername] = useState(globalProfileName);
  const [workspaceName, setWorkspaceName] = useState("My AI Workspace");
  const [workspaceColor, setWorkspaceColor] = useState("#2563eb");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [careerRole, setCareerRole] = useState("AI Specialist");
  const { theme: currentContextTheme, setTheme: updateThemeContext } = useContext(ThemeContext);
  const [selectedTheme, setSelectedTheme] = useState(() => currentContextTheme || "light");

  useEffect(() => {
    const isCompleted = localStorage.getItem("onboarding_tour_completed");
    if (!isCompleted) {
      setIsOpen(true);
    }
  }, []);

  const { addNotification } = useContext(NotificationContext);

  const handleFinishOnboarding = () => {
    // Save properties
    localStorage.setItem("onboarding_tour_completed", "true");
    localStorage.setItem("weekly_target_hours", String(weeklyHours));
    localStorage.setItem("target_career_role", careerRole);
    localStorage.setItem("onboarding_workspace_color", workspaceColor);
    
    // Save to AppContext
    setProfileName(username);

    setIsOpen(false);
    logger.info("[Onboarding Tour] Setup wizard successfully completed.");
    if (addNotification) {
      addNotification("🏆 Onboarding Completed!", "Workspace initialized. Gained +250 XP.", "success", "achievement");
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem("onboarding_tour_completed", "true");
    setIsOpen(false);
  };

  const applyTheme = (mode) => {
    setSelectedTheme(mode);
    if (updateThemeContext) {
      updateThemeContext(mode);
    }
  };

  const getRecommendedRoadmap = () => {
    switch (careerRole) {
      case "AI Specialist":
        return ["Classical ML", "Deep Learning Foundations", "Advanced NLP Modules"];
      case "MLOps Specialist":
        return ["Python Automation", "Kubernetes Scaling", "Continuous ML Integration"];
      case "Fullstack Builder":
        return ["Modern React Layouts", "Node Backend APIs", "Vite Server Optimizations"];
      default:
        return ["Foundations", "Intermediate", "Advanced Blocks"];
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "520px" }} className="modal-scale-enter">
        <Card style={{ padding: "30px", background: "#0c0f19", border: "1.5px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)" }}>
          
          {/* Header Progress indicators */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <Badge type="primary" style={{ fontSize: "10.5px", padding: "2px 8px", textTransform: "uppercase" }}>
              Step {activeStep + 1} of 8
            </Badge>
            <button onClick={skipOnboarding} style={{ background: "none", border: "none", color: "var(--light-text)", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}>
              Skip Setup
            </button>
          </div>

          {/* Progress bar line */}
          <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "25px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((activeStep + 1) / 8) * 100}%`, background: "var(--primary)", transition: "width 0.3s ease" }} />
          </div>

          {/* WIZARD PANELS SELECTION */}

          {/* Step 0: Welcome Screen */}
          {activeStep === 0 && (
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "52px" }}>🚀</span>
              <h2 style={{ fontSize: "20px", fontWeight: "850", color: "white", margin: "15px 0 8px" }}>Welcome to AI Engineer OS</h2>
              <p style={{ fontSize: "13.5px", color: "var(--light-text)", lineHeight: "1.6" }}>
                You have successfully unlocked your premium developer platform. Let's custom configure your workspace environment settings in 8 simple steps.
              </p>
            </div>
          )}

          {/* Step 1: Profile Completion */}
          {activeStep === 1 && (
            <div>
              <h3 style={{ fontSize: "17px", color: "white", fontWeight: "800", margin: "0 0 10px" }}>👤 Profile Setup</h3>
              <p style={{ fontSize: "13px", color: "var(--light-text)", margin: "0 0 20px" }}>
                What is your username or handle to represent your achievements streak logs?
              </p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  background: "#1e293b",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>
          )}

          {/* Step 2: Workspace Setup */}
          {activeStep === 2 && (
            <div>
              <h3 style={{ fontSize: "17px", color: "white", fontWeight: "800", margin: "0 0 10px" }}>📂 Initialize First Workspace</h3>
              <p style={{ fontSize: "13px", color: "var(--light-text)", margin: "0 0 15px" }}>
                Create your starting Notion-style workspace partition.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#1e293b",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "white",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <div>
                  <label style={{ fontSize: "12px", color: "var(--light-text)", display: "block", marginBottom: "8px" }}>Accent Profile Color</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["#2563eb", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setWorkspaceColor(c)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: c,
                          border: workspaceColor === c ? "3px solid white" : "1px solid transparent",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Learning Goal Setup */}
          {activeStep === 3 && (
            <div>
              <h3 style={{ fontSize: "17px", color: "white", fontWeight: "800", margin: "0 0 10px" }}>📚 Target Weekly Study Velocity</h3>
              <p style={{ fontSize: "13px", color: "var(--light-text)", margin: "0 0 20px" }}>
                Choose your weekly goal target hour velocity. We'll track your daily velocity trends.
              </p>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span style={{ fontSize: "36px", fontWeight: "900", color: "var(--primary)", display: "block", marginBottom: "15px" }}>
                  {weeklyHours} Hours / Week
                </span>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
                />
              </div>
            </div>
          )}

          {/* Step 4: Career Goal Setup */}
          {activeStep === 4 && (
            <div>
              <h3 style={{ fontSize: "17px", color: "white", fontWeight: "800", margin: "0 0 10px" }}>💼 Select Desired Career Path</h3>
              <p style={{ fontSize: "13px", color: "var(--light-text)", margin: "0 0 15px" }}>
                Select your focus track area to customize your learning recommendations lists.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { name: "AI Specialist", desc: "Focuses on NLP models, tuning architectures, and PyTorch." },
                  { name: "MLOps Specialist", desc: "Focuses on Docker pipelines, Kubernetes orchestration, and scaling." },
                  { name: "Fullstack Builder", desc: "Focuses on UI components logic, Node API routing, and system builds." }
                ].map((role) => (
                  <div
                    key={role.name}
                    onClick={() => setCareerRole(role.name)}
                    style={{
                      border: `1.5px solid ${careerRole === role.name ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      background: careerRole === role.name ? "rgba(37,99,235,0.04)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    <strong style={{ display: "block", fontSize: "13px", color: "white" }}>{role.name}</strong>
                    <span style={{ fontSize: "11.5px", color: "var(--light-text)" }}>{role.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Theme Selection */}
          {activeStep === 5 && (
            <div>
              <h3 style={{ fontSize: "17px", color: "white", fontWeight: "800", margin: "0 0 10px" }}>🎨 Theme & Layout Mode</h3>
              <p style={{ fontSize: "13px", color: "var(--light-text)", margin: "0 0 20px" }}>
                Choose a visual color scheme layout style.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { id: "dark", label: "Midnight Dark" },
                  { id: "light", label: "Sleek Light" },
                  { id: "dracula", label: "Dracula Purple" },
                  { id: "cyberpunk", label: "Neon Cyberpunk" }
                ].map((th) => (
                  <Button
                    key={th.id}
                    onClick={() => applyTheme(th.id)}
                    type={selectedTheme === th.id ? "primary" : "outline"}
                    style={{ padding: "14px 10px" }}
                  >
                    {th.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Roadmap Recommendation */}
          {activeStep === 6 && (
            <div>
              <h3 style={{ fontSize: "17px", color: "white", fontWeight: "800", margin: "0 0 10px" }}>🎯 Recommended Study Roadmap</h3>
              <p style={{ fontSize: "13px", color: "var(--light-text)", margin: "0 0 15px" }}>
                Based on your focus choice (<strong>{careerRole}</strong>), we have customized these roadmap milestones templates:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "15px", borderRadius: "8px" }}>
                {getRecommendedRoadmap().map((t, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#cbd5e1" }}>
                    <span style={{ color: "var(--primary)" }}>✦</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Walkthrough Completed */}
          {activeStep === 7 && (
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "52px" }}>🏆</span>
              <h2 style={{ fontSize: "20px", fontWeight: "850", color: "white", margin: "15px 0 8px" }}>OS Setup Completed!</h2>
              <p style={{ fontSize: "13.5px", color: "var(--light-text)", lineHeight: "1.6", marginBottom: "20px" }}>
                Your profiles, workspace variables, target velocity checklists, and theme overrides are successfully initialized. Ready to begin your developer journey?
              </p>
            </div>
          )}

          {/* Nav Controls buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <button
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              style={{
                background: "none",
                border: "none",
                color: activeStep === 0 ? "#475569" : "var(--light-text)",
                cursor: activeStep === 0 ? "default" : "pointer",
                fontSize: "13px",
                fontWeight: "600"
              }}
            >
              Back
            </button>

            {activeStep < 7 ? (
              <Button onClick={() => setActiveStep(prev => prev + 1)} type="primary" style={{ padding: "8px 24px" }}>
                Next Phase →
              </Button>
            ) : (
              <Button onClick={handleFinishOnboarding} type="success" style={{ padding: "8px 24px" }}>
                Begin Work! 🚀
              </Button>
            )}
          </div>

        </Card>
      </div>
    </div>
  );
}

export default OnboardingWelcomeTour;
