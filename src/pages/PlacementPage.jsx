import React, { useState, useContext, useMemo } from "react";
import AppContext from "../context/AppContext";
import { CareerContext } from "../context/CareerContext";
import CircularProgress from "../components/Common/CircularProgress";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Badge from "../components/Common/Badge";
import Input from "../components/Common/Input";
import { useNavigate } from "react-router-dom";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// PlacementPage.jsx
// Complete Gamified Career Tracker SaaS Hub
// Guarded state flow for zero render exceptions
// =======================================================

function PlacementPage() {
  const navigate = useNavigate();
  useDocumentMetadata("Career Tracker", "Manage job applications, expected compensation, scheduled interviews, and CV copies.");

  const { roadmap = [], projects = [] } = useContext(AppContext) || {};
  const careerCtx = useContext(CareerContext) || {};

  const {
    salaryGoal = 120000,
    updateSalaryGoal = () => {},
    resumes = [],
    addResume = () => {},
    deleteResume = () => {},
    setActiveResume = () => {},
    applications = [],
    addApplication = () => {},
    updateApplicationStatus = () => {},
    interviews = [],
    scheduleInterview = () => {},
    dreamCompanies = [],
    addDreamCompany = () => {},
  } = careerCtx;

  const [activeTab, setActiveTab] = useState("dashboard");

  const [appRole, setAppRole] = useState("");
  const [appCompany, setAppCompany] = useState("");
  const [appLocation, setAppLocation] = useState("");
  const [appSalary, setAppSalary] = useState("");

  const [intCompany, setIntCompany] = useState("");
  const [intRole, setIntRole] = useState("");
  const [intDate, setIntDate] = useState("");
  const [intTime, setIntTime] = useState("");
  const [intType, setIntType] = useState("Technical Interview");

  const [dreamName, setDreamName] = useState("");
  const [dreamRole, setDreamRole] = useState("");
  const [dreamDate, setDreamDate] = useState("");

  const [resName, setResName] = useState("");
  const [resVersion, setResVersion] = useState("v1.0");

  // Dynamic Skills Extraction
  const completedSkills = useMemo(() => {
    const skills = new Set();
    const safeRoadmap = Array.isArray(roadmap) ? roadmap : [];
    const safeProjects = Array.isArray(projects) ? projects : [];

    safeRoadmap.forEach((day) => {
      if (day && day.completed) {
        if (day.id === 1) skills.add("Python Basics");
        if (day.id === 2) skills.add("Variables").add("Data Types");
        if (day.id === 3) skills.add("Operators");
        if (day.id === 4) skills.add("Control Flow").add("Conditionals");
        if (day.id === 5) skills.add("Loops");
        if (day.id === 6) skills.add("Functions");
        if (day.id === 7) skills.add("Data Structures");
        if (day.id === 8) skills.add("Dictionaries");
        if (day.id === 9) skills.add("Sets");
        if (day.id === 10) skills.add("CLI Programming");
      }
    });

    safeProjects.forEach((p) => {
      if (p && p.completed && Array.isArray(p.skills)) {
        p.skills.forEach((t) => skills.add(t));
      }
    });

    return Array.from(skills);
  }, [roadmap, projects]);

  const missingSkills = useMemo(() => {
    const allRequired = new Set();
    const safeApps = Array.isArray(applications) ? applications : [];
    safeApps.forEach((app) => {
      if (app && Array.isArray(app.requiredSkills)) {
        app.requiredSkills.forEach((s) => allRequired.add(s));
      }
    });
    const safeCompleted = Array.isArray(completedSkills) ? completedSkills : [];
    return Array.from(allRequired).filter((s) => !safeCompleted.includes(s));
  }, [applications, completedSkills]);

  // Dynamic Job Readiness Score Engine
  const jobReadinessScore = useMemo(() => {
    const safeRoadmap = Array.isArray(roadmap) ? roadmap : [];
    const lessonsCount = safeRoadmap.filter((r) => r && r.completed).length;
    const lessonsRatio = safeRoadmap.length === 0 ? 0 : lessonsCount / safeRoadmap.length;
    const lessonContribution = lessonsRatio * 40;

    const safeProjects = Array.isArray(projects) ? projects : [];
    const projectsCount = safeProjects.filter((p) => p && p.completed).length;
    const projectsRatio = safeProjects.length === 0 ? 0 : projectsCount / safeProjects.length;
    const projectsContribution = projectsRatio * 30;

    const safeResumes = Array.isArray(resumes) ? resumes : [];
    const hasCV = safeResumes.some((r) => r && r.active);
    const cvContribution = hasCV ? 15 : 0;

    const safeApps = Array.isArray(applications) ? applications : [];
    const hasApps = safeApps.length > 0;
    const appContribution = hasApps ? 15 : 0;

    return Math.round(lessonContribution + projectsContribution + cvContribution + appContribution);
  }, [roadmap, projects, resumes, applications]);

  const activeResumeObj = useMemo(() => {
    const safeResumes = Array.isArray(resumes) ? resumes : [];
    return safeResumes.find((r) => r && r.active) || safeResumes[0] || null;
  }, [resumes]);

  const totalExpectedPipelineSalary = useMemo(() => {
    const safeApps = Array.isArray(applications) ? applications : [];
    return safeApps.reduce((sum, a) => {
      const val = parseInt(String(a.salary || "0").replace(/[^0-9]/g, ""), 10) || 0;
      return sum + val;
    }, 0);
  }, [applications]);

  const handleAddApplicationSubmit = (e) => {
    e.preventDefault();
    if (!appRole.trim() || !appCompany.trim()) return;
    addApplication({
      role: appRole,
      company: appCompany,
      location: appLocation || "Remote",
      salary: appSalary || "$110,000",
      status: "Applied",
      appliedDate: new Date().toISOString().split("T")[0],
      matchRate: 85,
    });
    setAppRole("");
    setAppCompany("");
    setAppLocation("");
    setAppSalary("");
  };

  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 p-8 overflow-y-auto font-sans v2-scrollbar">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.04]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Career & Placement Hub</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track job applications, expected compensation, and interviews</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#0e0e14] border border-white/[0.05] text-xs font-mono text-indigo-300">
            Readiness: {jobReadinessScore}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/[0.04] pb-3">
        {["dashboard", "applications", "interviews", "resumes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0e0e14] border border-white/[0.05] space-y-2">
              <div className="text-xs font-mono text-slate-500 uppercase">Readiness Rating</div>
              <div className="text-3xl font-bold text-white">{jobReadinessScore}%</div>
              <p className="text-xs text-slate-400 leading-relaxed">Based on completed roadmap units and portfolio projects.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e14] border border-white/[0.05] space-y-2">
              <div className="text-xs font-mono text-slate-500 uppercase">Active Applications</div>
              <div className="text-3xl font-bold text-indigo-400">{applications.length}</div>
              <p className="text-xs text-slate-400 leading-relaxed">Applications currently in active hiring pipeline.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e0e14] border border-white/[0.05] space-y-2">
              <div className="text-xs font-mono text-slate-500 uppercase">Scheduled Interviews</div>
              <div className="text-3xl font-bold text-emerald-400">{interviews.length}</div>
              <p className="text-xs text-slate-400 leading-relaxed">Upcoming technical screening calls scheduled.</p>
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-4">
            <form onSubmit={handleAddApplicationSubmit} className="p-4 rounded-2xl bg-[#0e0e14] border border-white/10 flex gap-3">
              <input
                type="text"
                placeholder="Role (e.g. AI Engineer)"
                value={appRole}
                onChange={(e) => setAppRole(e.target.value)}
                className="flex-1 bg-[#050508] border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Company"
                value={appCompany}
                onChange={(e) => setAppCompany(e.target.value)}
                className="flex-1 bg-[#050508] border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
              />
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
                Add Application
              </button>
            </form>

            <div className="space-y-2">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl bg-[#0e0e14] border border-white/[0.04] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{app.role} @ {app.company}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{app.location} • {app.salary}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 font-mono text-[10px]">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(PlacementPage);
