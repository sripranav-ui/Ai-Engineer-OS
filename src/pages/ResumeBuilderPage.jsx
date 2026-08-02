import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CareerContext } from "../context/CareerContext";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// ResumeBuilderPage.jsx
// Side-by-side interactive Resume Builder workspace
// =======================================================

const DEFAULT_RESUME_DATA = {
  profile: {
    name: "Pranav",
    email: "pranav@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    jobTitle: "AI Engineer",
    bio: "Passionate AI Engineering specialist skilled in building conversational agents, LLM tool-calling integrations, and high-fidelity full-stack React portals.",
  },
  education: [
    { id: 1, school: "Stanford University", degree: "M.S. in Computer Science (AI Track)", dates: "2024 - 2026", grade: "GPA 3.9" }
  ],
  experience: [
    { id: 1, company: "AI Labs Inc", role: "Junior NLP Developer", dates: "Jan 2025 - Present", desc: "Built micro-services utilizing OpenAI APIs, engineered tool-calling actions, and optimized model responses by 22%." }
  ],
  projects: [
    { id: 1, title: "AI Assistant Dashboard", tech: "React, Node.js, Python", desc: "Designed side-by-side model workspace sandbox featuring real-time diagnostic lint overlays.", link: "github.com/pranav/assistant" }
  ],
  skills: "Python Basics, API Tool-Calling, React, Vector DBs, Prompt Engineering, JSON Interfaces",
  certificates: "Core Python Programming Certificate, Advanced AI Systems Specialist",
  achievements: "1st Place Hackathon Agent Challenge, Top 5% AI Engineering Candidate",
  socials: {
    github: "github.com/pranav",
    linkedin: "linkedin.com/in/pranav",
    portfolio: "pranav.dev",
  }
};

function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { addResume } = useContext(CareerContext);
  useDocumentMetadata("AI Resume Builder", "Design and format professional resumes in real-time, matching multiple templates.");

  const [activeAccordion, setActiveAccordion] = useState("profile"); // profile | education | experience | projects | skills | certificates | achievements | socials
  const [template, setTemplate] = useState("tech"); // tech | minimal | executive
  const [resumeTitle, setResumeTitle] = useState("My AI Engineer Resume");
  const [resumeVersion, setResumeVersion] = useState("v1.0");

  // Load from local storage or fallback
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem("resume_builder_data");
    return saved ? JSON.parse(saved) : DEFAULT_RESUME_DATA;
  });

  useEffect(() => {
    localStorage.setItem("resume_builder_data", JSON.stringify(resumeData));
  }, [resumeData]);

  // Form Field Updaters
  const updateProfile = (key, val) => {
    setResumeData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: val },
    }));
  };

  const updateSocials = (key, val) => {
    setResumeData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: val },
    }));
  };

  // Education array actions
  const handleAddEducation = () => {
    const newItem = { id: Date.now(), school: "", degree: "", dates: "", grade: "" };
    setResumeData((prev) => ({ ...prev, education: [...prev.education, newItem] }));
  };

  const handleUpdateEducation = (id, key, val) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, [key]: val } : item)),
    }));
  };

  const handleRemoveEducation = (id) => {
    setResumeData((prev) => ({ ...prev, education: prev.education.filter((item) => item.id !== id) }));
  };

  // Experience array actions
  const handleAddExperience = () => {
    const newItem = { id: Date.now(), company: "", role: "", dates: "", desc: "" };
    setResumeData((prev) => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  const handleUpdateExperience = (id, key, val) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, [key]: val } : item)),
    }));
  };

  const handleRemoveExperience = (id) => {
    setResumeData((prev) => ({ ...prev, experience: prev.experience.filter((item) => item.id !== id) }));
  };

  // Projects array actions
  const handleAddProject = () => {
    const newItem = { id: Date.now(), title: "", tech: "", desc: "", link: "" };
    setResumeData((prev) => ({ ...prev, projects: [...prev.projects, newItem] }));
  };

  const handleUpdateProject = (id, key, val) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, [key]: val } : item)),
    }));
  };

  const handleRemoveProject = (id) => {
    setResumeData((prev) => ({ ...prev, projects: prev.projects.filter((item) => item.id !== id) }));
  };

  // Trigger A4 Document print
  const handlePrint = () => {
    window.print();
  };

  // Save to profile CV Versions list
  const handleSaveToProfile = () => {
    addResume(resumeTitle, resumeVersion);
    alert(`🎉 Successfully saved "${resumeTitle} (${resumeVersion})" to your Career Tracker profile!`);
    navigate("/placement");
  };

  return (
    <div className="content fade-in print-container-wrap">
      {/* Header section */}
      <div className="page-header no-print" style={{ marginBottom: "25px" }}>
        <div>
          <h1 style={{ margin: 0 }}>📄 AI Resume Builder</h1>
          <p style={{ margin: "5px 0 0", color: "#94a3b8" }}>
            Design, format, and structure professional resumes in real-time. Print to PDF when finished.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={() => navigate("/placement")} type="outline">
            ← Career Tracker
          </Button>
          <Button onClick={handlePrint} type="primary" style={{ background: "#10b981", borderColor: "#059669" }}>
            🖨️ Export PDF
          </Button>
        </div>
      </div>

      {/* Main workspace row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "30px",
        }}
        className="builder-workspace-grid"
      >
        {/* ==================== LEFT COLUMN: FORM EDITORS (No Print) ==================== */}
        <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Metadata settings */}
          <Card style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 15px", fontSize: "15px" }}>📁 Resume Versioning</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "10px" }}>
              <Input label="Document Title" value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} />
              <Input label="Version" value={resumeVersion} onChange={(e) => setResumeVersion(e.target.value)} />
            </div>
            <Button onClick={handleSaveToProfile} type="outline" fullWidth style={{ marginTop: "15px", fontSize: "13px" }}>
              💾 Save Draft to Career Profile
            </Button>
          </Card>

          {/* Collapsible Form Sections */}
          <Card style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 15px", fontSize: "16px", color: "var(--text-primary)" }}>📝 Resume Editor</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Profile accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "profile" ? "" : "profile")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  👤 Personal Profile
                </button>
                {activeAccordion === "profile" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px", background: "var(--surface-1)" }}>
                    <Input label="Full Name" value={resumeData.profile.name} onChange={(e) => updateProfile("name", e.target.value)} />
                    <Input label="Job Title" value={resumeData.profile.jobTitle} onChange={(e) => updateProfile("jobTitle", e.target.value)} />
                    <Input label="Email" value={resumeData.profile.email} onChange={(e) => updateProfile("email", e.target.value)} />
                    <Input label="Phone" value={resumeData.profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} />
                    <Input label="Location" value={resumeData.profile.location} onChange={(e) => updateProfile("location", e.target.value)} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Professional Summary</label>
                      <textarea
                        value={resumeData.profile.bio}
                        onChange={(e) => updateProfile("bio", e.target.value)}
                        className="form-textarea"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Education accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "education" ? "" : "education")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  🎓 Education History
                </button>
                {activeAccordion === "education" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "15px", background: "var(--surface-1)" }}>
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Input label="School Name" value={edu.school} onChange={(e) => handleUpdateEducation(edu.id, "school", e.target.value)} />
                        <Input label="Degree" value={edu.degree} onChange={(e) => handleUpdateEducation(edu.id, "degree", e.target.value)} />
                        <Input label="Dates" placeholder="e.g. 2022 - 2026" value={edu.dates} onChange={(e) => handleUpdateEducation(edu.id, "dates", e.target.value)} />
                        <Input label="Grade / Notes" placeholder="e.g. GPA 3.8" value={edu.grade} onChange={(e) => handleUpdateEducation(edu.id, "grade", e.target.value)} />
                        <button type="button" onClick={() => handleRemoveEducation(edu.id)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "12px", cursor: "pointer", alignSelf: "flex-end" }}>
                          Remove School
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddEducation} style={{ border: "1px dashed var(--border-strong)", background: "none", color: "var(--accent-gold)", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
                      + Add Education
                    </button>
                  </div>
                )}
              </div>

              {/* Experience accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "experience" ? "" : "experience")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  💼 Work Experience
                </button>
                {activeAccordion === "experience" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "15px", background: "var(--surface-1)" }}>
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Input label="Company" value={exp.company} onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)} />
                        <Input label="Role" value={exp.role} onChange={(e) => handleUpdateExperience(exp.id, "role", e.target.value)} />
                        <Input label="Dates" placeholder="e.g. Jan 2024 - Present" value={exp.dates} onChange={(e) => handleUpdateExperience(exp.id, "dates", e.target.value)} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Description</label>
                          <textarea
                            value={exp.desc}
                            onChange={(e) => handleUpdateExperience(exp.id, "desc", e.target.value)}
                            className="form-textarea"
                          />
                        </div>
                        <button type="button" onClick={() => handleRemoveExperience(exp.id)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "12px", cursor: "pointer", alignSelf: "flex-end" }}>
                          Remove Experience
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddExperience} style={{ border: "1px dashed var(--border-strong)", background: "none", color: "var(--accent-gold)", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
                      + Add Work Experience
                    </button>
                  </div>
                )}
              </div>

              {/* Projects accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "projects" ? "" : "projects")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  💻 Key Projects
                </button>
                {activeAccordion === "projects" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "15px", background: "var(--surface-1)" }}>
                    {resumeData.projects.map((proj) => (
                      <div key={proj.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Input label="Project Title" value={proj.title} onChange={(e) => handleUpdateProject(proj.id, "title", e.target.value)} />
                        <Input label="Tech Stack" placeholder="e.g. React, Python" value={proj.tech} onChange={(e) => handleUpdateProject(proj.id, "tech", e.target.value)} />
                        <Input label="Workspace Link" value={proj.link} onChange={(e) => handleUpdateProject(proj.id, "link", e.target.value)} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Description</label>
                          <textarea
                            value={proj.desc}
                            onChange={(e) => handleUpdateProject(proj.id, "desc", e.target.value)}
                            className="form-textarea"
                          />
                        </div>
                        <button type="button" onClick={() => handleRemoveProject(proj.id)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "12px", cursor: "pointer", alignSelf: "flex-end" }}>
                          Remove Project
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddProject} style={{ border: "1px dashed var(--border-strong)", background: "none", color: "var(--accent-gold)", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
                      + Add Project
                    </button>
                  </div>
                )}
              </div>

              {/* Skills accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "skills" ? "" : "skills")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  ⚡ Skills Inventory
                </button>
                {activeAccordion === "skills" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}>
                    <Input label="Technical Skills (Comma separated)" value={resumeData.skills} onChange={(e) => setResumeData(prev => ({ ...prev, skills: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Certificates accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "certificates" ? "" : "certificates")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  🏆 Certificates
                </button>
                {activeAccordion === "certificates" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}>
                    <Input label="Certifications (Comma separated)" value={resumeData.certificates} onChange={(e) => setResumeData(prev => ({ ...prev, certificates: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Achievements accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "achievements" ? "" : "achievements")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  🏅 Key Achievements
                </button>
                {activeAccordion === "achievements" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}>
                    <Input label="Achievements (Comma separated)" value={resumeData.achievements} onChange={(e) => setResumeData(prev => ({ ...prev, achievements: e.target.value }))} />
                  </div>
                )}
              </div>

              {/* Social Links accordion */}
              <div style={{ border: "1px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "socials" ? "" : "socials")}
                  style={{ width: "100%", textAlign: "left", background: "var(--surface-2)", border: "none", padding: "12px 16px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                >
                  🌐 Social & Web Links
                </button>
                {activeAccordion === "socials" && (
                  <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "12px", background: "var(--surface-1)" }}>
                    <Input label="GitHub Link" value={resumeData.socials.github} onChange={(e) => updateSocials("github", e.target.value)} />
                    <Input label="LinkedIn Link" value={resumeData.socials.linkedin} onChange={(e) => updateSocials("linkedin", e.target.value)} />
                    <Input label="Portfolio Web URL" value={resumeData.socials.portfolio} onChange={(e) => updateSocials("portfolio", e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ==================== RIGHT COLUMN: DOCUMENT PREVIEW PANEL ==================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Template Selectors */}
          <Card className="no-print" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>Choose Resume Template</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="form-select"
                style={{ width: "auto" }}
              >
                <option value="tech">Tech Professional</option>
                <option value="minimal">Modern Minimalist</option>
                <option value="executive">Executive Slate</option>
              </select>
            </div>
          </Card>

          {/* Printable Document preview wrapper */}
          <div
            id="printable-resume-card"
            className={`printable-sheet-template resume-template-${template}`}
            style={{
              background: "#ffffff",
              color: "#1e293b",
              borderRadius: "8px",
              padding: "40px",
              minHeight: "840px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: template === "minimal" ? "Georgia, serif" : "Arial, sans-serif",
            }}
          >
            {/* -------------------- TEMPLATE: TECH PROFESSIONAL -------------------- */}
            {template === "tech" && (
              <div>
                {/* Header Profile Info banner */}
                <div style={{ borderBottom: "3.5px solid var(--primary)", paddingBottom: "15px", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0, fontSize: "28px", color: "#000000", fontWeight: "800" }}>
                    {resumeData.profile.name}
                  </h2>
                  <span style={{ fontSize: "14px", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase" }}>
                    {resumeData.profile.jobTitle}
                  </span>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "10px", fontSize: "11px", color: "#475569" }}>
                    {resumeData.profile.email && <span>📧 {resumeData.profile.email}</span>}
                    {resumeData.profile.phone && <span>📞 {resumeData.profile.phone}</span>}
                    {resumeData.profile.location && <span>📍 {resumeData.profile.location}</span>}
                    {resumeData.socials.github && <span>💻 {resumeData.socials.github}</span>}
                    {resumeData.socials.linkedin && <span>🔗 {resumeData.socials.linkedin}</span>}
                  </div>
                </div>

                {/* Professional Bio summary */}
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#334155", fontStyle: "italic" }}>
                    {resumeData.profile.bio}
                  </p>
                </div>

                {/* Experience section */}
                {resumeData.experience.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: "14px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase" }}>
                      Experience
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                            <span style={{ color: "#000000" }}>{exp.role}</span>
                            <span style={{ fontSize: "12px", color: "#475569" }}>{exp.dates}</span>
                          </div>
                          <span style={{ display: "block", fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>{exp.company}</span>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#334155" }}>{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects section */}
                {resumeData.projects.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: "14px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase" }}>
                      Projects
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                            <span style={{ color: "#000000" }}>{proj.title} <span style={{ fontWeight: "normal", fontSize: "11px", color: "#64748b" }}>({proj.tech})</span></span>
                            {proj.link && <span style={{ fontSize: "11px", color: "var(--primary)" }}>{proj.link}</span>}
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#334155" }}>{proj.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills columns section */}
                {resumeData.skills && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: "14px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase" }}>
                      Technical Skills
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#334155" }}>
                      {resumeData.skills}
                    </p>
                  </div>
                )}

                {/* Two-column Footer stats (Education & Certs) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: "13px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase" }}>
                      Education
                    </h3>
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} style={{ fontSize: "11px" }}>
                        <strong style={{ color: "#000000" }}>{edu.degree}</strong>
                        <span style={{ display: "block" }}>{edu.school}</span>
                        <span style={{ color: "#64748b" }}>{edu.dates} • {edu.grade}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    {resumeData.certificates && (
                      <div style={{ marginBottom: "10px" }}>
                        <h3 style={{ margin: "0 0 6px", fontSize: "13px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase" }}>
                          Certifications
                        </h3>
                        <p style={{ margin: 0, fontSize: "11px", color: "#334155" }}>{resumeData.certificates}</p>
                      </div>
                    )}
                    {resumeData.achievements && (
                      <div>
                        <h3 style={{ margin: "0 0 6px", fontSize: "13px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase" }}>
                          Achievements
                        </h3>
                        <p style={{ margin: 0, fontSize: "11px", color: "#334155" }}>{resumeData.achievements}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: MODERN MINIMALIST -------------------- */}
            {template === "minimal" && (
              <div style={{ textAlign: "center" }}>
                {/* Profile Header details */}
                <h2 style={{ margin: "0 0 4px", fontSize: "28px", color: "#111827", fontWeight: "300", letterSpacing: "0.05em" }}>
                  {resumeData.profile.name.toUpperCase()}
                </h2>
                <span style={{ fontSize: "12px", color: "#4b5563", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {resumeData.profile.jobTitle}
                </span>

                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", margin: "12px 0 20px", fontSize: "11px", color: "#6b7280" }}>
                  <span>{resumeData.profile.email}</span>
                  <span>•</span>
                  <span>{resumeData.profile.phone}</span>
                  <span>•</span>
                  <span>{resumeData.profile.location}</span>
                  {resumeData.socials.github && (
                    <>
                      <span>•</span>
                      <span>{resumeData.socials.github}</span>
                    </>
                  )}
                </div>

                <div style={{ width: "60px", height: "1px", background: "#d1d5db", margin: "0 auto 20px" }} />

                {/* Professional bio */}
                <p style={{ margin: "0 0 25px", fontSize: "12px", color: "#374151", textAlign: "justify", lineHeight: "1.6" }}>
                  {resumeData.profile.bio}
                </p>

                {/* Experience list */}
                {resumeData.experience.length > 0 && (
                  <div style={{ textAlign: "left", marginBottom: "25px" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#111827", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Work Experience
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <strong style={{ color: "#111827" }}>{exp.company}</strong>
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>{exp.dates}</span>
                          </div>
                          <span style={{ display: "block", fontSize: "12px", color: "#4b5563", fontStyle: "italic", margin: "2px 0 4px" }}>{exp.role}</span>
                          <p style={{ margin: 0, fontSize: "12px", color: "#374151" }}>{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills list */}
                {resumeData.skills && (
                  <div style={{ textAlign: "left", marginBottom: "25px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: "13px", color: "#111827", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Skills
                    </h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#374151" }}>{resumeData.skills}</p>
                  </div>
                )}

                {/* Education list */}
                {resumeData.education.length > 0 && (
                  <div style={{ textAlign: "left", marginBottom: "25px" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: "13px", color: "#111827", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Education
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <strong style={{ color: "#111827" }}>{edu.school}</strong>
                            <span style={{ display: "block", fontSize: "11px", color: "#4b5563" }}>{edu.degree} • {edu.grade}</span>
                          </div>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>{edu.dates}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- TEMPLATE: EXECUTIVE SLATE -------------------- */}
            {template === "executive" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "25px", margin: "-40px", minHeight: "840px" }}>
                {/* Left Gray column sidebar */}
                <div style={{ background: "#f1f5f9", padding: "40px 25px", borderRight: "1px solid #e2e8f0" }}>
                  <h3 style={{ fontSize: "20px", color: "#0f172a", fontWeight: "800", margin: "0 0 4px" }}>
                    {resumeData.profile.name}
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "20px" }}>
                    {resumeData.profile.jobTitle}
                  </span>

                  {/* Contacts */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px", color: "#475569", marginBottom: "25px" }}>
                    {resumeData.profile.email && <span>📧 {resumeData.profile.email}</span>}
                    {resumeData.profile.phone && <span>📞 {resumeData.profile.phone}</span>}
                    {resumeData.profile.location && <span>📍 {resumeData.profile.location}</span>}
                  </div>

                  {/* Education sidebar */}
                  <div style={{ marginBottom: "25px" }}>
                    <h4 style={{ fontSize: "12px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>
                      Education
                    </h4>
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} style={{ fontSize: "11px", marginBottom: "8px" }}>
                        <strong style={{ color: "#0f172a", display: "block" }}>{edu.degree}</strong>
                        <span>{edu.school}</span>
                        <span style={{ display: "block", color: "#64748b" }}>{edu.dates}</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills tags */}
                  <div>
                    <h4 style={{ fontSize: "12px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>
                      Skills
                    </h4>
                    <p style={{ margin: 0, fontSize: "11px", color: "#475569", lineHeight: "1.4" }}>
                      {resumeData.skills}
                    </p>
                  </div>
                </div>

                {/* Right main column body */}
                <div style={{ padding: "40px 25px 40px 0" }}>
                  {/* Summary */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "12px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>
                      Profile
                    </h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>
                      {resumeData.profile.bio}
                    </p>
                  </div>

                  {/* Work history */}
                  {resumeData.experience.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h4 style={{ fontSize: "12px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>
                        Experience
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                              <span style={{ color: "#0f172a" }}>{exp.role}</span>
                              <span style={{ fontSize: "11px", color: "#64748b" }}>{exp.dates}</span>
                            </div>
                            <span style={{ display: "block", fontSize: "11px", color: "var(--primary)", fontWeight: "600" }}>{exp.company}</span>
                            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#334155" }}>{exp.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: "12px", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", color: "#000000", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>
                        Projects
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {resumeData.projects.map((proj) => (
                          <div key={proj.id}>
                            <strong style={{ color: "#0f172a", fontSize: "12px" }}>{proj.title}</strong>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#334155" }}>{proj.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ResumeBuilderPage);
