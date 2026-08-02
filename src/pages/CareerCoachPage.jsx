import React, { useState, useMemo, useEffect } from "react";
import {
  FaUserGraduate,
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaBrain,
  FaFolder,
  FaGithub,
  FaLinkedin,
  FaFileAlt,
  FaDollarSign,
  FaRoad,
  FaChevronRight,
  FaPlay,
  FaRedo,
  FaStar,
  FaSearch,
  FaAward,
  FaClock,
  FaBookOpen,
  FaChartLine,
  FaUserAlt
} from "react-icons/fa";

// Import custom common components from workspace
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import Avatar from "../components/Common/Avatar";
import Badge from "../components/Common/Badge";
import CircularProgress from "../components/Common/CircularProgress";

// Import career coach mock databases
import {
  initialSkillsGap,
  initialInterviewsMock,
  initialTimeline,
  initialCompanyRoadmaps,
  salaryBrackets
} from "../data/careerMockData";

function CareerCoachPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "skill-gap" | "interviews" | "reviews" | "salary" | "roadmaps"

  // Data states in local memory
  const [skillsList, setSkillsList] = useState(initialSkillsGap);
  const [interviewsList, setInterviewsList] = useState(initialInterviewsMock);
  const [timelineList, setTimelineList] = useState(initialTimeline);
  const [roadmapsList, setRoadmapsList] = useState(initialCompanyRoadmaps);

  // Active question in Mock Interview
  const [activeQuestionId, setActiveQuestionId] = useState(initialInterviewsMock[0]?.id || "");
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewResult, setInterviewResult] = useState(null); // { score: number, matched: [], missed: [] }
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);

  // Reviews Suite states
  const [reviewType, setReviewType] = useState("resume"); // "resume" | "portfolio" | "github" | "linkedin"
  const [reviewInputText, setReviewInputText] = useState("");
  const [reviewReport, setReviewReport] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  // Salary Estimator states
  const [salaryRole, setSalaryRole] = useState("AI Engineer");
  const [salaryExp, setSalaryExp] = useState("Mid-Level");

  // Filter category for mock interviews
  const [interviewTypeFilter, setInterviewTypeFilter] = useState("all"); // "all" | "behavioral" | "technical"

  // Simple simulated career notifications
  const [careerTips, setCareerTips] = useState([
    "💡 Tip: Ensure your GitHub repositories have structured READMEs detailing model hyperparameters.",
    "💡 Tip: Use action verbs on LinkedIn like 'architected', 'vectorized', and 'fine-tuned' to beat ATS search filters."
  ]);
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate career tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % careerTips.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [careerTips]);

  // Keep track of active interview question object
  const activeQuestion = useMemo(() => {
    return interviewsList.find(q => q.id === activeQuestionId) || interviewsList[0];
  }, [interviewsList, activeQuestionId]);

  // Filters interview questions
  const filteredQuestions = useMemo(() => {
    if (interviewTypeFilter === "all") return interviewsList;
    return interviewsList.filter(q => q.type === interviewTypeFilter);
  }, [interviewsList, interviewTypeFilter]);

  // Automatically reset answers when question changes
  useEffect(() => {
    setUserAnswer("");
    setInterviewResult(null);
    setInterviewSubmitted(false);
  }, [activeQuestionId]);

  // Calculate dynamic readiness score based on skills acquired and mock interviews passed
  const readinessScore = useMemo(() => {
    // Each skill completed contributes to score
    // Max skills contribution: 50%
    const maxSkills = skillsList.length;
    const completedSkillsCount = skillsList.filter(s => s.currentLevel >= s.targetLevel).length;
    const skillsContribution = maxSkills === 0 ? 0 : (completedSkillsCount / maxSkills) * 50;

    // Timeline progress contribution: 20%
    const completedMilestones = timelineList.filter(t => t.status === "completed").length;
    const timelineContribution = (completedMilestones / timelineList.length) * 20;

    // Mock interviews score contribution: 30%
    // If the user has scored in mock prep, we add contribution
    const interviewPassedContribution = interviewSubmitted && interviewResult?.score >= 60 ? 30 : 15;

    return Math.round(skillsContribution + timelineContribution + interviewPassedContribution);
  }, [skillsList, timelineList, interviewSubmitted, interviewResult]);

  // Handles updating skill competency levels in real time
  const handleLevelUpSkill = (skillId) => {
    setSkillsList(prev =>
      prev.map(s => {
        if (s.id === skillId) {
          const nextLevel = Math.min(5, s.currentLevel + 1);
          return { ...s, currentLevel: nextLevel };
        }
        return s;
      })
    );
  };

  // Mock Interview evaluation engine
  const handleEvaluateAnswer = () => {
    if (!userAnswer.trim()) return;

    setInterviewSubmitted(true);
    const text = userAnswer.toLowerCase();
    const tokens = activeQuestion.expectedTokens;

    const matched = [];
    const missed = [];

    tokens.forEach(tok => {
      if (text.includes(tok)) {
        matched.push(tok);
      } else {
        missed.push(tok);
      }
    });

    // Score: 100% if all tokens match, proportion otherwise
    // Give base 30 points if they write a response at all
    const keywordPoints = tokens.length === 0 ? 0 : (matched.length / tokens.length) * 70;
    const finalScore = Math.round(30 + keywordPoints);

    setInterviewResult({
      score: finalScore,
      matched: matched,
      missed: missed
    });
  };

  // Reviews Simulator Engine
  const handleRunReview = () => {
    if (!reviewInputText.trim()) return;

    setReviewing(true);
    setReviewReport(null);

    setTimeout(() => {
      let score = 75;
      let checklist = [];

      if (reviewType === "resume") {
        const text = reviewInputText.toLowerCase();
        const hasMetrics = /\d+%|\$\d+|year/.test(text);
        const hasPython = text.includes("python");
        const hasAgents = text.includes("agent") || text.includes("langgraph");

        score = 65 + (hasMetrics ? 12 : 0) + (hasPython ? 10 : 0) + (hasAgents ? 10 : 0);
        score = Math.min(98, score);

        checklist = [
          { label: "Quantified Business Impact metrics (percentages, revenues)", passed: hasMetrics, detail: hasMetrics ? "Detected cost/accuracy metrics." : "Add quantified metrics (e.g. 'reduced model latency by 40%')." },
          { label: "AI & Programming Keyword optimization (Python, PyTorch)", passed: hasPython, detail: hasPython ? "Python keywords match." : "Include core programming language identifiers." },
          { label: "Advanced Framework parameters (Agents, LangGraph, RAG)", passed: hasAgents, detail: hasAgents ? "Found agent frameworks references." : "Mention modern agentic pipelines." },
          { label: "ATS formatting & clear header structures", passed: true, detail: "File layout meets indexable standards." }
        ];
      } else if (reviewType === "portfolio") {
        const hasHttp = reviewInputText.includes("http");
        checklist = [
          { label: "Working live deploy link", passed: hasHttp, detail: hasHttp ? "Detected demo URL." : "Add active deployment URLs to host your apps." },
          { label: "Comprehensive documentation & architecture layouts", passed: true, detail: "Good structure layout diagrams." },
          { label: "Tech stack badges alignment indicators", passed: false, detail: "Missing tags. List what DB/Libraries are active in cards." }
        ];
        score = hasHttp ? 85 : 55;
      } else if (reviewType === "github") {
        const hasReadme = reviewInputText.includes("readme") || reviewInputText.includes("github.com");
        checklist = [
          { label: "README files present in all key repositories", passed: hasReadme, detail: hasReadme ? "README checks out." : "A project without a README is invisible. Add setup instructions." },
          { label: "Clean directory organization (src/, scripts/, test/)", passed: true, detail: "Folders meet packaging standards." },
          { label: "License declarations (.gitignore and LICENSE)", passed: false, detail: "Consider adding MIT/Apache license files." }
        ];
        score = hasReadme ? 80 : 60;
      } else {
        // LinkedIn
        const hasSummary = reviewInputText.length > 50;
        checklist = [
          { label: "Compelling profile summary showing technical focus", passed: hasSummary, detail: hasSummary ? "Headline is solid." : "Expand summary (min 150 characters) to target ML keywords." },
          { label: "Direct certifications links registered", passed: true, detail: "Linked credentials checks out." },
          { label: "Active postings and contribution shares", passed: false, detail: "Try sharing weekly coding challenges posts to boost visibility." }
        ];
        score = hasSummary ? 82 : 62;
      }

      setReviewReport({
        score: score,
        checklist: checklist
      });
      setReviewing(false);
    }, 1800);
  };

  // Salary Estimator visual ranges calculations
  const currentSalaryBracket = useMemo(() => {
    return salaryBrackets[salaryRole]?.[salaryExp] || { min: 80000, median: 110000, max: 140000 };
  }, [salaryRole, salaryExp]);

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans desktop-scrollbar">
      {/* Header Info Panel */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">AI Career Coach Console</h1>
          <p className="text-xs text-slate-400 mt-0.5">Diagnose engineering competency gaps, prep with STAR frameworks, and estimate salary bounds</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setActiveTab("interviews")} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95">
            <FaBrain /> Start Mock Round
          </button>
          <button onClick={() => setActiveTab("reviews")} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-[#090C14] text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm">
            <FaFileAlt /> Review CV Draft
          </button>
        </div>
      </div>

      {/* Interactive Tips Banner */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-purple-300 mb-6 flex items-center gap-2.5">
        <span className="text-base">💡</span>
        <em className="not-italic font-medium">{careerTips[tipIndex]}</em>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090C14] border border-white/10 w-fit mb-6 overflow-x-auto">
        <button className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "dashboard" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`} onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </button>
        <button className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "skill-gap" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`} onClick={() => setActiveTab("skill-gap")}>
          Skill Gaps
        </button>
        <button className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "interviews" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`} onClick={() => setActiveTab("interviews")}>
          Mock Interviews
        </button>
        <button className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "reviews" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`} onClick={() => setActiveTab("reviews")}>
          Reviews Suite
        </button>
        <button className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "salary" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`} onClick={() => setActiveTab("salary")}>
          Salary Estimator
        </button>
        <button className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "roadmaps" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"}`} onClick={() => setActiveTab("roadmaps")}>
          Roadmaps
        </button>
      </div>

      {/* 1. TAB CONTENT: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="coach-grid fade-in">
          <div className="coach-main-col">
            {/* Readiness circular block */}
            <Card style={{ padding: "25px" }}>
              <div className="readiness-score-header">
                <CircularProgress
                  progress={readinessScore}
                  size={120}
                  strokeWidth={10}
                  label={`${readinessScore}%`}
                  color="#8b5cf6"
                />
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <h3 style={{ color: "var(--text-primary)", fontSize: "20px", margin: 0, fontWeight: "800" }}>Overall Job Readiness Score</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", margin: "6px 0 15px 0", lineHeight: "1.5" }}>
                    Your coaching score compiles acquired skills, completed milestone phases, and mock interview answers. Reaching &gt;80% triggers simulated company recommendations.
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Badge type="success">Acquired Skills: {skillsList.filter(s => s.currentLevel >= s.targetLevel).length} / {skillsList.length}</Badge>
                    <Badge type="primary">Passed Interviews: {interviewSubmitted && interviewResult?.score >= 60 ? "1" : "0"}</Badge>
                    <Badge type="warning">Active CV: Registered</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Skills Summary Chart */}
            <Card style={{ padding: "25px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "16px", margin: "0 0 15px 0" }}>⚡ Core Skills Competencies Graph</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {skillsList.map(skill => (
                  <div key={skill.id} style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ width: "200px", color: "#cbd5e1", fontWeight: 600 }}>{skill.name}</span>
                    <div style={{ flex: 1, height: "8px", background: "#1e293b", borderRadius: "4px", overflow: "hidden", margin: "0 20px" }}>
                      <div style={{ width: `${(skill.currentLevel / 5) * 100}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: "4px" }} />
                    </div>
                    <span style={{ color: "#60a5fa", fontWeight: "bold" }}>Lvl {skill.currentLevel}/5</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar checklist widgets */}
          <div className="coach-side-col">
            <Card style={{ padding: "20px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "14px", margin: "0 0 12px 0" }}>🏆 Daily Coaching Quests</h3>
              <div className="readiness-bulletins">
                <div className="readiness-bullet-item">
                  <span style={{ fontSize: "12.5px", color: "#cbd5e1" }}>Complete a technical Mock Q&A</span>
                  <span style={{ color: "#10b981" }}>+50 XP</span>
                </div>
                <div className="readiness-bullet-item">
                  <span style={{ fontSize: "12.5px", color: "#cbd5e1" }}>Mark 1 skill gap as completed</span>
                  <span style={{ color: "#10b981" }}>+30 XP</span>
                </div>
                <div className="readiness-bullet-item">
                  <span style={{ fontSize: "12.5px", color: "#cbd5e1" }}>Audit your resume keywords</span>
                  <span style={{ color: "#10b981" }}>+40 XP</span>
                </div>
              </div>
            </Card>

            <Card style={{ background: "rgba(16,185,129,0.04)", borderColor: "rgba(16,185,129,0.15)" }}>
              <h3 style={{ color: "#10b981", fontSize: "14px", margin: "0 0 8px 0" }}>💼 Hiring Recommendations</h3>
              <p style={{ color: "#cbd5e1", fontSize: "12px", lineHeight: "1.4", margin: 0 }}>
                Based on your Python and Vector index skills, we suggest checking the **Stripe Product AI** roadmap under the roadmaps tab!
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT: SKILL GAP */}
      {activeTab === "skill-gap" && (
        <div className="coach-grid fade-in">
          <div className="coach-main-col" style={{ gridColumn: "span 12" }}>
            <Card style={{ padding: "25px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "18px", margin: "0 0 15px 0" }}>🎯 Skill Gap Diagnosis & Level-Up Path</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", margin: "0 0 20px 0" }}>
                Diagnose skill discrepancies against hiring metrics. Click 'Level Up Skill' to simulate training blocks and complete target requirements.
              </p>

              <div className="skill-gap-list">
                {skillsList.map(skill => {
                  const targetAcquired = skill.currentLevel >= skill.targetLevel;
                  return (
                    <div key={skill.id} className="skill-gap-row">
                      <div className="skill-gap-meta">
                        <div>
                          <span className="skill-gap-name">{skill.name}</span>
                          <span style={{ marginLeft: "10px", fontSize: "10.5px", background: "rgba(255,255,255,0.06)", color: "#cbd5e1", padding: "2px 6px", borderRadius: "4px" }}>
                            {skill.category}
                          </span>
                        </div>
                        {targetAcquired ? (
                          <Badge type="success">✓ Target Level Met</Badge>
                        ) : (
                          <Button size="xs" onClick={() => handleLevelUpSkill(skill.id)} type="primary">
                            Level Up Skill
                          </Button>
                        )}
                      </div>

                      <div className="skill-level-bars-container">
                        <div className="skill-level-indicator">
                          <span className="level-bar-label">Current Level (Lvl {skill.currentLevel})</span>
                          <div className="level-bar-fill-track">
                            <div className="level-bar-fill current" style={{ width: `${(skill.currentLevel / 5) * 100}%` }} />
                          </div>
                        </div>
                        <div className="skill-level-indicator">
                          <span className="level-bar-label">Target Level (Lvl {skill.targetLevel})</span>
                          <div className="level-bar-fill-track">
                            <div className="level-bar-fill target" style={{ width: `${(skill.targetLevel / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "4px 0" }}>{skill.details}</p>

                      <div className="skill-gap-recommendations">
                        <strong>Coaching Recommendations:</strong>
                        <ul style={{ margin: "5px 0 0 15px", padding: 0 }}>
                          {skill.recommendations.map((rec, i) => (
                            <li key={i} style={{ marginBottom: "2px" }}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: MOCK INTERVIEWS */}
      {activeTab === "interviews" && (
        <div className="coach-grid fade-in">
          {/* Main Chat Area */}
          <div className="coach-main-col">
            <div className="interview-chat-container">
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-default)", background: "var(--surface-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-primary)", fontSize: "13.5px", fontWeight: "700" }}>🗣️ Live Prep Chatbot</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>STAR framework active evaluation</span>
              </div>

              <div className="interview-chat-log">
                {/* Coach message */}
                <div className="interview-bubble coach">
                  <strong>AI Interview Coach:</strong>
                  <p style={{ margin: "5px 0 0 0" }}>{activeQuestion?.question}</p>
                  <span style={{ display: "block", fontSize: "10.5px", color: "#8b5cf6", marginTop: "8px", fontWeight: "700" }}>
                    ℹ️ Grading checklist targets: {activeQuestion?.expectedTokens.join(", ")}
                  </span>
                </div>

                {/* User answer submission logs */}
                {interviewSubmitted && (
                  <div className="interview-bubble user">
                    <strong>You:</strong>
                    <p style={{ margin: "5px 0 0 0" }}>{userAnswer}</p>
                  </div>
                )}

                {/* Diagnostic Feedback report */}
                {interviewResult && (
                  <div className="interview-evaluation-card fade-in">
                    <div className="evaluation-score-row">
                      <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>📊 Grader Diagnostics Report</strong>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: interviewResult.score >= 70 ? "#10b981" : "#fbbf24" }}>
                        Score: {interviewResult.score} / 100
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "6px 0 12px 0", lineHeight: "1.4" }}>
                      Graded based on query parameters matched. Check structured items list below:
                    </p>

                    <div className="evaluation-keywords">
                      {interviewResult.matched.map(tok => (
                        <span key={tok} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(16,185,129,0.3)" }}>
                          ✔ {tok} (matched)
                        </span>
                      ))}
                      {interviewResult.missed.map(tok => (
                        <span key={tok} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", fontSize: "10.5px", padding: "2px 6px", borderRadius: "4px", border: "1px solid rgba(239,68,68,0.2)" }}>
                          ✖ {tok} (omitted)
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: "15px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <p style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 800, margin: "0 0 4px 0" }}>EXPERT MODEL STRUCTURE ANSWER</p>
                      <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0, lineHeight: 1.4 }}>{activeQuestion?.modelAnswer}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input panel */}
              <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#090d16" }}>
                {!interviewSubmitted ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <textarea
                      placeholder="Type your structured answer here. Include specific STAR milestones..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      style={{
                        width: "100%",
                        height: "80px",
                        background: "#0c0f1b",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "white",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "13px",
                        outline: "none",
                        resize: "none"
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button onClick={handleEvaluateAnswer} type="primary" disabled={!userAnswer.trim()}>
                        Evaluate Answer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button onClick={() => { setUserAnswer(""); setInterviewSubmitted(false); setInterviewResult(null); }} type="outline">
                      <FaRedo style={{ marginRight: "6px" }} /> Try Again / Clear
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Question Selectors */}
          <div className="coach-side-col">
            <Card style={{ padding: "20px" }}>
              <h3 style={{ color: "white", fontSize: "14px", margin: "0 0 15px 0" }}>📂 Question Library</h3>
              
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                <button
                  className={`leaderboard-toggle-btn ${interviewTypeFilter === "all" ? "active" : ""}`}
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={() => setInterviewTypeFilter("all")}
                >
                  All
                </button>
                <button
                  className={`leaderboard-toggle-btn ${interviewTypeFilter === "behavioral" ? "active" : ""}`}
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={() => setInterviewTypeFilter("behavioral")}
                >
                  Behavioral
                </button>
                <button
                  className={`leaderboard-toggle-btn ${interviewTypeFilter === "technical" ? "active" : ""}`}
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={() => setInterviewTypeFilter("technical")}
                >
                  Technical
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredQuestions.map(q => (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    style={{
                      padding: "8px 12px",
                      background: q.id === activeQuestionId ? "rgba(139, 92, 246, 0.1)" : "rgba(255,255,255,0.01)",
                      border: `1px solid ${q.id === activeQuestionId ? "#8b5cf6" : "rgba(255,255,255,0.04)"}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: q.id === activeQuestionId ? "white" : "#94a3b8",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>{q.category}</span>
                    <span style={{ fontSize: "10px", color: q.type === "behavioral" ? "#a78bfa" : "#60a5fa" }}>{q.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: REVIEWS */}
      {activeTab === "reviews" && (
        <div className="coach-grid fade-in">
          <div className="coach-main-col">
            <Card style={{ padding: "25px" }}>
              <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "20px" }}>
                <button className={`coach-tab-btn ${reviewType === "resume" ? "active" : ""}`} onClick={() => { setReviewType("resume"); setReviewReport(null); setReviewInputText(""); }}>
                  📄 Resume Audit
                </button>
                <button className={`coach-tab-btn ${reviewType === "portfolio" ? "active" : ""}`} onClick={() => { setReviewType("portfolio"); setReviewReport(null); setReviewInputText(""); }}>
                  🎨 Portfolio
                </button>
                <button className={`coach-tab-btn ${reviewType === "github" ? "active" : ""}`} onClick={() => { setReviewType("github"); setReviewReport(null); setReviewInputText(""); }}>
                  🐙 GitHub Tree
                </button>
                <button className={`coach-tab-btn ${reviewType === "linkedin" ? "active" : ""}`} onClick={() => { setReviewType("linkedin"); setReviewReport(null); setReviewInputText(""); }}>
                  💼 LinkedIn
                </button>
              </div>

              <div className="review-input-box">
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                  {reviewType === "resume" ? "Paste your plain-text resume content to analyze formatting and ATS keywords compatibility." : reviewType === "portfolio" ? "Paste your Portfolio showcase landing page URL link:" : reviewType === "github" ? "Paste your public GitHub username or repository link:" : "Paste your LinkedIn professional profile headline or summary text:"}
                </p>

                <textarea
                  placeholder={reviewType === "resume" ? "Alex Rivera\nAI Specialist\nSkills: Python, PyTorch...\nDesigned RAG system yielding 40% speedups..." : "https://my-portfolio.ai"}
                  value={reviewInputText}
                  onChange={(e) => setReviewInputText(e.target.value)}
                  style={{
                    width: "100%",
                    height: reviewType === "resume" ? "120px" : "40px",
                    background: "#0c0f1b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "white",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button onClick={handleRunReview} type="primary" disabled={!reviewInputText.trim() || reviewing}>
                    {reviewing ? "⚙️ Ingesting and Auditing..." : "Run AI Review"}
                  </Button>
                </div>
              </div>

              {/* Review Report Display */}
              {reviewReport && (
                <div className="review-feedback-report fade-in">
                  <div className="feedback-score-radial">
                    <CircularProgress
                      progress={reviewReport.score}
                      size={70}
                      strokeWidth={6}
                      label={`${reviewReport.score}`}
                      color="#8b5cf6"
                    />
                    <div>
                      <h4 style={{ color: "var(--text-primary)", fontSize: "15px", margin: 0 }}>Diagnostic Review Score</h4>
                      <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0 0 0" }}>Checked against ATS parameters guidelines.</p>
                    </div>
                  </div>

                  <div className="feedback-checklist">
                    <span className="community-section-label" style={{ fontSize: "9px" }}>AUDIT CRITERIA CHECKLIST</span>
                    {reviewReport.checklist.map((item, idx) => (
                      <div key={idx} className="feedback-check-item">
                        <span className={`feedback-check-icon ${item.passed ? "passed" : "warn"}`}>
                          {item.passed ? <FaCheckCircle /> : <FaTimesCircle />}
                        </span>
                        <div>
                          <strong style={{ display: "block", fontSize: "13px", color: "var(--text-primary)" }}>{item.label}</strong>
                          <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>{item.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: SALARY ESTIMATOR */}
      {activeTab === "salary" && (
        <div className="coach-grid fade-in">
          <div className="coach-main-col">
            <Card style={{ padding: "25px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "18px", margin: "0 0 15px 0" }}>💵 AI Compensation Bracket Estimator</h3>
              <p style={{ color: "#94a3b8", fontSize: "13.5px", margin: "0 0 20px 0" }}>
                Select a target role and level of experience to view standard base salary distributions.
              </p>

              {/* Selectors */}
              <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>Select Target Role</label>
                  <select
                    value={salaryRole}
                    onChange={(e) => setSalaryRole(e.target.value)}
                    className="composer-select"
                    style={{ marginBottom: 0 }}
                  >
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="MLOps Architect">MLOps Architect</option>
                    <option value="AI Architect / Lead">AI Architect / Lead</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>Experience Bracket</label>
                  <select
                    value={salaryExp}
                    onChange={(e) => setSalaryExp(e.target.value)}
                    className="composer-select"
                    style={{ marginBottom: 0 }}
                  >
                    <option value="Junior">Junior (0-2 Yrs)</option>
                    <option value="Mid-Level">Mid-Level (2-4 Yrs)</option>
                    <option value="Senior">Senior (5+ Yrs)</option>
                  </select>
                </div>
              </div>

              {/* Visual Estimator range card */}
              <div className="salary-estimator-card">
                <span style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Estimated Base salary median</span>
                <h2 style={{ fontSize: "36px", color: "#10b981", fontWeight: "900", margin: "6px 0 0 0" }}>
                  ${currentSalaryBracket.median.toLocaleString()} / Year
                </h2>

                <div className="salary-range-bar-wrapper">
                  <div className="salary-range-track">
                    <div className="salary-range-pointer" style={{ left: "50%" }} />
                  </div>
                  <div className="salary-range-labels">
                    <span>Min: ${currentSalaryBracket.min.toLocaleString()}</span>
                    <span>Median</span>
                    <span>Max: ${currentSalaryBracket.max.toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ color: "#64748b", fontSize: "12px", margin: 0, fontStyle: "italic" }}>
                  *Values represent simulated US remote averages and cash compensation brackets. Excludes options/stock grants.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: ROADMAPS & TIMELINE */}
      {activeTab === "roadmaps" && (
        <div className="coach-grid fade-in">
          {/* Left Column: Timeline */}
          <div className="coach-main-col" style={{ gridColumn: "span 7" }}>
            <Card style={{ padding: "25px" }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: "16px", margin: "0 0 15px 0" }}>🛤️ AI Engineering Career Milestones</h3>
              
              <div className="vertical-timeline">
                {timelineList.map(node => (
                  <div key={node.id} className={`timeline-node ${node.status}`}>
                    <div className="timeline-node-bullet" />
                    
                    <div className="timeline-node-header">
                      <span className="timeline-node-title">{node.milestone}</span>
                      <span style={{ fontSize: "11px", color: "#8b5cf6", fontWeight: "700" }}>{node.duration}</span>
                    </div>

                    <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 8px 0" }}>{node.role}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {node.skillsRequired.map(sk => (
                        <span key={sk} style={{ fontSize: "9.5px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#cbd5e1", padding: "1px 5px", borderRadius: "4px" }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Company Roadmaps */}
          <div className="coach-side-col" style={{ gridColumn: "span 5" }}>
            <Card style={{ padding: "20px" }}>
              <h3 style={{ color: "white", fontSize: "14px", margin: "0 0 15px 0" }}>🏢 Company Interview Prep Roadmaps</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {roadmapsList.map(rm => (
                  <div
                    key={rm.company}
                    style={{
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid rgba(255,255,255,0.04)",
                      padding: "16px",
                      borderRadius: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong style={{ color: "white", fontSize: "13.5px" }}>{rm.company}</strong>
                      <Badge type="danger" style={{ fontSize: "9.5px" }}>{rm.difficulty}</Badge>
                    </div>

                    <p style={{ fontSize: "11.5px", color: "#fbbf24", margin: "0 0 10px 0" }}>Focus: {rm.focus}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#94a3b8" }}>
                      {rm.phases.map((ph, i) => (
                        <div key={i} style={{ display: "flex", gap: "6px" }}>
                          <span style={{ color: "#8b5cf6" }}>✔</span>
                          <span>{ph}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(CareerCoachPage);
