import React, { useState, useContext, useMemo, useEffect } from "react";
import { ProjectsContext } from "../../context/ProjectsContext";
import { DashboardContext } from "../../context/DashboardContext";
import Card from "../Common/Card";
import Badge from "../Common/Badge";
import Button from "../Common/Button";
import Input from "../Common/Input";

/**
 * Jira/Linear-inspired Project Management Suite Component
 */
export function ProjectDetails({ project }) {
  const { projects, setProjects } = useContext(ProjectsContext);
  const { awardXP } = useContext(DashboardContext);

  const [activeTab, setActiveTab] = useState("overview"); // overview | sprint | timeline | files | collaboration

  // --- Workspace Forms States ---
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskLabel, setNewTaskLabel] = useState("Task");
  const [newTaskDueDate, setNewTaskDueDate] = useState("2026-08-15");
  const [newCommentText, setNewCommentText] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(project?.files?.[0]?.id || null);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [showAddFileForm, setShowAddFileForm] = useState(false);

  // --- Task Detail Dialog States ---
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [newChecklistItemText, setNewChecklistItemText] = useState("");

  // --- Objective Form States ---
  const [newObjectiveText, setNewObjectiveText] = useState("");

  // --- Attachment States ---
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentSize, setNewAttachmentSize] = useState("");

  // Sync selected file when project switches
  useEffect(() => {
    if (project?.files?.length > 0) {
      setSelectedFileId(project.files[0].id);
    }
  }, [project]);

  const activeFile = useMemo(() => {
    if (!project) return null;
    const files = project.files || [];
    return files.find((f) => f.id === selectedFileId) || files[0] || null;
  }, [project, selectedFileId]);

  // --- Task Checklist & Subtask Modifiers ---
  const activeTask = useMemo(() => {
    return ((project && project.tasks) || []).find(t => t.id === activeTaskId) || null;
  }, [project, activeTaskId]);

  // --- Calendar Builder Helpers ---
  const monthDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 6; i++) {
      days.push(null);
    }
    for (let day = 1; day <= 31; day++) {
      const dateStr = `2026-08-${day < 10 ? "0" + day : day}`;
      days.push({ day, dateStr });
    }
    return days;
  }, []);

  if (!project) return null;

  // --- Safe Default Fallbacks & Lazy Initialization ---
  const objectives = project.objectives || [
    "Design and test a vector similarity search engine",
    "Integrate prompt template injections metrics",
    "Establish memory-safe context window boundaries"
  ];
  const estimatedCompletion = project.estimatedCompletion || "2026-08-25";
  const riskAnalysis = project.riskAnalysis || "Local rate limits thresholds when invoking deep reasoning APIs.";
  const aiSuggestions = project.aiSuggestions || "Leverage semantic caches for duplicate queries to trim down execution costs by 35%.";
  
  const attachments = project.attachments || [
    { name: "architecture_blueprint_v1.pdf", size: "1.8 MB" },
    { name: "sample_corpus_dataset.json", size: "480 KB" }
  ];
  const docLink = project.docLink || "https://docs.ai-engineer-os.com/guides";
  const demoLink = project.liveUrl || "https://demo.ai-engineer-os.com/project";
  const githubLink = project.githubUrl || "https://github.com/developer/ai-project";

  const teamMembers = project.teamMembers || [
    { name: "Pranav (You)", role: "Chief Architect", avatar: "🤖", color: "#3b82f6" },
    { name: "Sarah Chen", role: "LLM Researcher", avatar: "👩‍🔬", color: "#10b981" },
    { name: "Marcus Aurelius", role: "DevOps Engineer", avatar: "👨‍💻", color: "#8b5cf6" }
  ];

  const relatedLessons = project.relatedLessons || [
    "Introduction to RAG pipelines",
    "Managing Context Window Boundaries",
    "Vector Database Indexing Strategies"
  ];

  const activityTimeline = project.activityTimeline || [
    { user: "Pranav", action: "Initialized project repositories files nodes", time: "2 hours ago" },
    { user: "Sarah Chen", action: "Optimized embeddings models logic", time: "Yesterday" }
  ];

  // Unified updater helper
  const updateProjectData = (updatedFields) => {
    const updatedProjects = projects.map((item) => {
      if (item.id === project.id) {
        const nextItem = { ...item, ...updatedFields };

        // Recalculate progressPercent dynamically if tasks change
        if (updatedFields.tasks) {
          const totalTasks = updatedFields.tasks.length;
          const completedTasks = updatedFields.tasks.filter(t => t.status === "Completed").length;
          const pct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
          
          nextItem.progressPercent = pct;
          nextItem.completed = pct === 100;
          nextItem.kanbanStatus = pct === 100 ? "Completed" : (pct > 0 ? "In Progress" : "Not Started");
          
          if (nextItem.completed && !item.completed) {
            awardXP(250);
          }
        }
        return nextItem;
      }
      return item;
    });
    setProjects(updatedProjects);
  };

  const handleUpdateTaskDetail = (taskId, fieldsToUpdate) => {
    const updatedTasks = (project.tasks || []).map((t) => {
      if (t.id === taskId) {
        return { ...t, ...fieldsToUpdate };
      }
      return t;
    });
    updateProjectData({ tasks: updatedTasks });
  };

  // --- Kanban Movements ---
  const handleMoveTask = (taskId, nextStatus) => {
    const updatedTasks = (project.tasks || []).map((t) =>
      t.id === taskId ? { ...t, status: nextStatus } : t
    );
    
    const updatedActivities = [
      { user: "Pranav", action: `Moved task to ${nextStatus}`, time: "Just now" },
      ...activityTimeline
    ];

    updateProjectData({ tasks: updatedTasks, activityTimeline: updatedActivities });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      status: "To Do",
      priority: newTaskPriority,
      label: newTaskLabel,
      dueDate: newTaskDueDate,
      subtasks: [],
      checklist: []
    };
    const updatedTasks = [...(project.tasks || []), newTask];
    updateProjectData({ tasks: updatedTasks });
    setNewTaskText("");
  };

  // --- Subtasks & Checklists handlers ---
  const handleAddSubtask = (taskId, e) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const taskObj = (project.tasks || []).find(t => t.id === taskId);
    if (!taskObj) return;

    const sub = { id: Date.now(), text: newSubtaskText, completed: false };
    const subtasks = [...(taskObj.subtasks || []), sub];
    handleUpdateTaskDetail(taskId, { subtasks });
    setNewSubtaskText("");
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    const taskObj = (project.tasks || []).find(t => t.id === taskId);
    if (!taskObj) return;

    const subtasks = (taskObj.subtasks || []).map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    handleUpdateTaskDetail(taskId, { subtasks });
  };

  const handleAddChecklistItem = (taskId, e) => {
    e.preventDefault();
    if (!newChecklistItemText.trim()) return;
    const taskObj = (project.tasks || []).find(t => t.id === taskId);
    if (!taskObj) return;

    const check = { id: Date.now(), text: newChecklistItemText, completed: false };
    const checklist = [...(taskObj.checklist || []), check];
    handleUpdateTaskDetail(taskId, { checklist });
    setNewChecklistItemText("");
  };

  const handleToggleChecklist = (taskId, itemId) => {
    const taskObj = (project.tasks || []).find(t => t.id === taskId);
    if (!taskObj) return;

    const checklist = (taskObj.checklist || []).map(c =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    handleUpdateTaskDetail(taskId, { checklist });
  };

  // --- Objectives handlers ---
  const handleAddObjective = (e) => {
    e.preventDefault();
    if (!newObjectiveText.trim()) return;
    const nextObjectives = [...objectives, newObjectiveText.trim()];
    updateProjectData({ objectives: nextObjectives });
    setNewObjectiveText("");
  };

  const handleDeleteObjective = (idx) => {
    const nextObjectives = objectives.filter((_, i) => i !== idx);
    updateProjectData({ objectives: nextObjectives });
  };

  // --- Attachments handlers ---
  const handleAddAttachment = (e) => {
    e.preventDefault();
    if (!newAttachmentName.trim()) return;
    const nextAttachments = [
      ...attachments,
      { name: newAttachmentName.trim(), size: newAttachmentSize || "Unknown" }
    ];
    updateProjectData({ attachments: nextAttachments });
    setNewAttachmentName("");
    setNewAttachmentSize("");
  };

  // --- Comments ---
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "Pranav",
      text: newCommentText,
      date: "Just now"
    };
    const updatedComments = [...(project.comments || []), newComment];
    updateProjectData({ comments: updatedComments });
    setNewCommentText("");
  };

  // --- Files Explorer ---
  const handleUpdateFileCode = (code) => {
    if (!activeFile) return;
    const updatedFiles = (project.files || []).map((f) =>
      f.id === activeFile.id ? { ...f, content: code } : f
    );
    updateProjectData({ files: updatedFiles });
  };

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const newFile = {
      id: Date.now(),
      name: newFileName,
      language: newFileName.endsWith(".py") ? "python" : newFileName.endsWith(".md") ? "markdown" : "text",
      content: newFileContent || "# New File"
    };
    const updatedFiles = [...(project.files || []), newFile];
    updateProjectData({ files: updatedFiles });
    setSelectedFileId(newFile.id);
    setNewFileName("");
    setNewFileContent("");
    setShowAddFileForm(false);
  };

  // --- Calendar Builder Helpers ---

  const getCalendarEvents = (dateStr) => {
    const tasksDue = (project.tasks || []).filter(t => t.dueDate === dateStr);
    const isProjectCompletion = estimatedCompletion === dateStr;
    return { tasksDue, isProjectCompletion };
  };

  return (
    <Card style={{ padding: "30px", marginTop: "30px" }}>
      {/* Platform Workspace Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border)", paddingBottom: "20px", marginBottom: "25px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "24px", color: "white", fontWeight: "850" }}>{project.title}</h2>
            <Badge type={project.completed ? "success" : "warning"}>{project.kanbanStatus}</Badge>
          </div>
          <span style={{ fontSize: "12px", color: "var(--light-text)", textTransform: "uppercase", fontWeight: "700", marginTop: "6px", display: "block" }}>
            Est: {project.duration || "2 Weeks"} • {project.difficulty}
          </span>
        </div>

        {/* Workspace Tab Triggers */}
        <div style={{ display: "flex", gap: "6px", background: "rgba(0,0,0,0.15)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          {[
            { id: "overview", label: "📋 Overview" },
            { id: "sprint", label: "🏁 Sprint Board" },
            { id: "timeline", label: "📅 Timeline & Calendar" },
            { id: "files", label: "📁 Files & Resources" },
            { id: "collaboration", label: "👥 Collaboration" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "var(--primary)" : "none",
                color: activeTab === tab.id ? "white" : "var(--light-text)",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== TAB CONTENT BOARDS ==================== */}

      {/* 📋 TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr", gap: "30px" }} className="builder-workspace-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Description */}
            <div>
              <h3 style={{ fontSize: "15px", color: "white", margin: "0 0 10px 0", fontWeight: "800" }}>Workspace Description</h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.65", margin: 0 }}>{project.description}</p>
            </div>

            {/* Objectives List */}
            <div>
              <h3 style={{ fontSize: "15px", color: "white", margin: "0 0 12px 0", fontWeight: "800" }}>Core Objectives</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px" }}>
                {objectives.map((obj, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: "8px" }}>
                    <span style={{ color: "#cbd5e1", fontSize: "13.5px" }}>🎯 {obj}</span>
                    <button
                      onClick={() => handleDeleteObjective(idx)}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "14px" }}
                      title="Remove Objective"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Objective form */}
              <form onSubmit={handleAddObjective} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Define new objective target..."
                  value={newObjectiveText}
                  onChange={(e) => setNewObjectiveText(e.target.value)}
                  style={{ flex: 1, background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "6px", padding: "8px 12px", color: "var(--text-primary)", fontSize: "13px" }}
                />
                <Button type="outline" style={{ padding: "8px 16px" }}>Add</Button>
              </form>
            </div>

            {/* AI suggestions alert box */}
            <div style={{ background: "rgba(59, 130, 246, 0.03)", border: "1.5px dashed rgba(59, 130, 246, 0.2)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>🤖</span>
                <h4 style={{ margin: 0, color: "#93c5fd", fontSize: "14.5px", fontWeight: "700" }}>System Optimization Suggestions</h4>
              </div>
              <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6" }}>{aiSuggestions}</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Risk & Estimated Completion panel */}
            <Card style={{ background: "var(--surface-1)", border: "1.5px solid var(--border-default)" }}>
              <h4 style={{ margin: "0 0 14px 0", color: "var(--text-primary)", fontSize: "14px", fontWeight: "800" }}>Sprint Coordinates</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--light-text)" }}>Target Delivery:</span>
                  <strong style={{ color: "#f1f5f9" }}>{estimatedCompletion}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--light-text)" }}>Risk Severity:</span>
                  <Badge type="warning">Medium Hazard</Badge>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px" }}>
                  <span style={{ color: "var(--light-text)", display: "block", marginBottom: "6px" }}>Risk Analysis Notes:</span>
                  <span style={{ color: "#ef4444", fontSize: "12px", lineHeight: "1.5", display: "block" }}>
                    ⚠️ {riskAnalysis}
                  </span>
                </div>
              </div>
            </Card>

            {/* Overall progress indicator bar */}
            <Card style={{ background: "#0c0f19", border: "1.5px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "white", marginBottom: "10px", fontWeight: "750" }}>
                <span>Work Progress Percent</span>
                <span>{project.progressPercent}%</span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${project.progressPercent}%`, background: "var(--primary)", transition: "width 0.4s ease" }} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 🏁 TAB: KANBAN SPRINT BOARD */}
      {activeTab === "sprint" && (
        <div>
          {/* Add task parameters toolbar */}
          <form onSubmit={handleAddTask} style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Task name or description..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="form-input"
              style={{ flex: 2, minWidth: "220px" }}
              required
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="form-select"
              style={{ flex: 1, minWidth: "120px" }}
            >
              <option value="Low">🟢 Low Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="High">🔴 High Priority</option>
            </select>
            <select
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              className="form-select"
              style={{ flex: 1, minWidth: "120px" }}
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug Fix</option>
              <option value="Feature">Feature Dev</option>
              <option value="Research">Research</option>
            </select>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: "130px" }}
            />
            <Button type="primary" style={{ padding: "8px 18px" }}>＋ Sprint Task</Button>
          </form>

          {/* Kanban columns grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }} className="builder-workspace-grid">
            {["Backlog", "To Do", "In Progress", "Completed"].map((status) => {
              const statusTasks = (project.tasks || []).filter((t) => {
                const mappedStatus = t.status === "Completed" ? "Completed" : (t.status === "In Progress" ? "In Progress" : (t.status === "To Do" ? "To Do" : "Backlog"));
                return mappedStatus === status;
              });

              return (
                <div key={status} style={{ background: "var(--surface-2)", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "12px", minHeight: "350px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "800", textTransform: "uppercase" }}>{status}</span>
                    <Badge type="outline" style={{ fontSize: "10.5px" }}>{statusTasks.length}</Badge>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {statusTasks.map((t) => {
                      const hasSubtasks = t.subtasks?.length > 0;
                      const completedSubs = t.subtasks?.filter(s => s.completed).length || 0;
                      const hasChecklist = t.checklist?.length > 0;
                      const completedChecks = t.checklist?.filter(c => c.completed).length || 0;
                      
                      const isExpanded = activeTaskId === t.id;

                      return (
                        <div
                          key={t.id}
                          style={{
                            background: "var(--surface-1)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "8px",
                            padding: "12px",
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "border-color 0.2s"
                          }}
                          onClick={() => setActiveTaskId(isExpanded ? null : t.id)}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <Badge type={t.priority === "High" ? "danger" : (t.priority === "Medium" ? "warning" : "success")} style={{ fontSize: "9px" }}>
                              {t.priority}
                            </Badge>
                            <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "600" }}>{t.label || "Task"}</span>
                          </div>
                          
                          <p style={{ margin: "0 0 10px 0", color: "#f1f5f9", fontWeight: "600", fontSize: "13px" }}>{t.text}</p>
                          
                          {/* Mini indices indicators */}
                          <div style={{ display: "flex", gap: "10px", color: "var(--light-text)", fontSize: "11px", marginBottom: "10px" }}>
                            {hasSubtasks && (
                              <span>🛠️ {completedSubs}/{t.subtasks.length} subtasks</span>
                            )}
                            {hasChecklist && (
                              <span>📋 {completedChecks}/{t.checklist.length} check</span>
                            )}
                            {t.dueDate && (
                              <span>📅 {t.dueDate}</span>
                            )}
                          </div>

                          {/* Expanded detail panel */}
                          {isExpanded && (
                            <div
                              style={{
                                marginTop: "12px",
                                borderTop: "1px solid var(--border)",
                                paddingTop: "12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px"
                              }}
                              onClick={(e) => e.stopPropagation()} // Prevent collapse on clicks
                            >
                              {/* Subtasks listing */}
                              <div>
                                <strong style={{ display: "block", color: "white", marginBottom: "6px", fontSize: "11px" }}>Subtasks Checklist</strong>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  {(t.subtasks || []).map(sub => (
                                    <label key={sub.id} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#cbd5e1", fontSize: "11.5px" }}>
                                      <input
                                        type="checkbox"
                                        checked={sub.completed}
                                        onChange={() => handleToggleSubtask(t.id, sub.id)}
                                      />
                                      <span style={{ textDecoration: sub.completed ? "line-through" : "none" }}>{sub.text}</span>
                                    </label>
                                  ))}
                                </div>
                                <form onSubmit={(e) => handleAddSubtask(t.id, e)} style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                                  <input
                                    type="text"
                                    placeholder="Add subtask..."
                                    value={newSubtaskText}
                                    onChange={(e) => setNewSubtaskText(e.target.value)}
                                    style={{ flex: 1, background: "var(--surface-3)", border: "1px solid var(--border-default)", borderRadius: "4px", padding: "4px 8px", color: "var(--text-primary)", fontSize: "11px" }}
                                  />
                                  <Button type="outline" style={{ padding: "4px 8px", fontSize: "11px" }}>+</Button>
                                </form>
                              </div>

                              {/* Checklist item list */}
                              <div>
                                <strong style={{ display: "block", color: "var(--text-primary)", marginBottom: "6px", fontSize: "11px" }}>Verification Criteria</strong>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  {(t.checklist || []).map(c => (
                                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#cbd5e1", fontSize: "11.5px" }}>
                                      <input
                                        type="checkbox"
                                        checked={c.completed}
                                        onChange={() => handleToggleChecklist(t.id, c.id)}
                                      />
                                      <span style={{ textDecoration: c.completed ? "line-through" : "none" }}>{c.text}</span>
                                    </label>
                                  ))}
                                </div>
                                <form onSubmit={(e) => handleAddChecklistItem(t.id, e)} style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                                  <input
                                    type="text"
                                    placeholder="Add checklist item..."
                                    value={newChecklistItemText}
                                    onChange={(e) => setNewChecklistItemText(e.target.value)}
                                    style={{ flex: 1, background: "var(--surface-3)", border: "1px solid var(--border-default)", borderRadius: "4px", padding: "4px 8px", color: "var(--text-primary)", fontSize: "11px" }}
                                  />
                                  <Button type="outline" style={{ padding: "4px 8px", fontSize: "11px" }}>+</Button>
                                </form>
                              </div>

                              {/* Update status shortcuts */}
                              <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                                {status !== "Backlog" && (
                                  <button
                                    onClick={() => handleMoveTask(t.id, status === "Completed" ? "In Progress" : (status === "In Progress" ? "To Do" : "Backlog"))}
                                    style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--light-text)", borderRadius: "4px", padding: "4px 0", fontSize: "10px", cursor: "pointer" }}
                                  >
                                    ← Move Back
                                  </button>
                                )}
                                {status !== "Completed" && (
                                  <button
                                    onClick={() => handleMoveTask(t.id, status === "Backlog" ? "To Do" : (status === "To Do" ? "In Progress" : "Completed"))}
                                    style={{ flex: 1, background: "var(--primary)", border: "none", color: "white", borderRadius: "4px", padding: "4px 0", fontSize: "10px", cursor: "pointer", fontWeight: "700" }}
                                  >
                                    Promote →
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📅 TAB: TIMELINE & CALENDAR */}
      {activeTab === "timeline" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: "35px" }} className="builder-workspace-grid">
          {/* Timeline Gantt Section */}
          <div>
            <h3 style={{ fontSize: "15px", color: "white", margin: "0 0 12px 0", fontWeight: "800" }}>Milestone Progress Timeline</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "2px solid var(--border)", paddingLeft: "20px", marginLeft: "10px" }}>
              {(project.milestones || []).map((m, i) => (
                <div key={m.id} style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "-27px",
                      top: "4px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: m.completed ? "#10b981" : "#475569",
                      border: "2px solid #0f172a"
                    }}
                  />
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "13.5px", color: m.completed ? "#94a3b8" : "white", textDecoration: m.completed ? "line-through" : "none" }}>
                        {m.title}
                      </strong>
                      <span style={{ fontSize: "11px", color: "var(--light-text)" }}>Phase {i + 1}</span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: m.completed ? "#10b981" : "var(--light-text)" }}>
                      {m.completed ? "✅ Completed Successfully" : "⏳ Pending Implementation"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* August 2026 Monthly Calendar Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "15px", color: "white", margin: 0, fontWeight: "800" }}>August 2026 Calendar</h3>
              <span style={{ fontSize: "11.5px", color: "var(--primary)", fontWeight: "600" }}>Task Due Dates Map</span>
            </div>

            <div style={{ border: "1.5px solid var(--border)", borderRadius: "8px", background: "rgba(0,0,0,0.15)", overflow: "hidden" }}>
              {/* Day names headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "rgba(255,255,255,0.02)", borderBottom: "1.5px solid var(--border)", textAlign: "center", padding: "8px 0" }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} style={{ fontSize: "11px", fontWeight: "700", color: "var(--light-text)" }}>{d}</span>
                ))}
              </div>

              {/* Grid cell nodes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {monthDays.map((item, idx) => {
                  if (!item) {
                    return <div key={idx} style={{ minHeight: "55px", borderBottom: "1px solid var(--border)", borderRight: "1px solid var(--border)" }} />;
                  }

                  const { tasksDue, isProjectCompletion } = getCalendarEvents(item.dateStr);
                  const hasEvents = tasksDue.length > 0 || isProjectCompletion;

                  return (
                    <div
                      key={idx}
                      style={{
                        minHeight: "55px",
                        borderBottom: "1px solid var(--border)",
                        borderRight: "1px solid var(--border)",
                        padding: "4px",
                        background: hasEvents ? "rgba(59, 130, 246, 0.02)" : "none",
                        position: "relative"
                      }}
                    >
                      <span style={{ fontSize: "10.5px", color: "white", fontWeight: "700" }}>{item.day}</span>
                      
                      {/* Render Events */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                        {tasksDue.map(t => (
                          <div
                            key={t.id}
                            style={{
                              fontSize: "7.5px",
                              background: t.priority === "High" ? "#ef4444" : (t.priority === "Medium" ? "#f59e0b" : "#10b981"),
                              color: "white",
                              padding: "1px 2px",
                              borderRadius: "2px",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis"
                            }}
                            title={t.text}
                          >
                            {t.text}
                          </div>
                        ))}
                        {isProjectCompletion && (
                          <div
                            style={{
                              fontSize: "7.5px",
                              background: "var(--primary)",
                              color: "white",
                              padding: "1px 2px",
                              borderRadius: "2px",
                              fontWeight: "bold"
                            }}
                            title="Target Delivery Deadline"
                          >
                            🏁 Est. Delivery
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📁 TAB: FILES & RESOURCES */}
      {activeTab === "files" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "25px" }} className="builder-workspace-grid">
          <div>
            {/* File explorer tree */}
            <h3 style={{ fontSize: "14px", color: "white", margin: "0 0 8px 0", fontWeight: "800" }}>Virtual Workspace Files</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", background: "rgba(0,0,0,0.1)" }}>
              {(project.files || []).map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFileId(f.id); setShowAddFileForm(false); }}
                  style={{
                    background: activeFile?.id === f.id ? "rgba(59, 130, 246, 0.08)" : "none",
                    border: "none",
                    color: activeFile?.id === f.id ? "var(--primary)" : "#cbd5e1",
                    textAlign: "left",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    fontWeight: activeFile?.id === f.id ? "700" : "500",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  🐍 {f.name}
                </button>
              ))}
              <Button type="outline" onClick={() => setShowAddFileForm(true)} style={{ marginTop: "8px", padding: "4px 0", fontSize: "11.5px" }}>
                ＋ Create Code File
              </Button>
            </div>

            {/* Attachments listing section */}
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "14px", color: "white", margin: "0 0 8px 0", fontWeight: "800" }}>Attachments & Drafts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                {attachments.map((att, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: "6px", fontSize: "12px" }}>
                    <span style={{ color: "#cbd5e1" }}>📎 {att.name}</span>
                    <span style={{ color: "var(--light-text)", fontSize: "11px" }}>{att.size}</span>
                  </div>
                ))}
              </div>

              {/* Add simulated attachment form */}
              <form onSubmit={handleAddAttachment} style={{ display: "flex", gap: "4px" }}>
                <input
                  type="text"
                  placeholder="File name (e.g. schema.png)"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  style={{ flex: 1, background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "4px", padding: "4px 8px", color: "var(--text-primary)", fontSize: "11.5px" }}
                  required
                />
                <input
                  type="text"
                  placeholder="Size (e.g. 1.2 MB)"
                  value={newAttachmentSize}
                  onChange={(e) => setNewAttachmentSize(e.target.value)}
                  style={{ width: "80px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "4px", padding: "4px 8px", color: "var(--text-primary)", fontSize: "11.5px" }}
                />
                <Button type="outline" style={{ padding: "4px 8px" }}>+</Button>
              </form>
            </div>

            {/* External repository resources */}
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "14px", color: "var(--text-primary)", margin: "0 0 8px 0", fontWeight: "800" }}>Repository Gateways</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <a href={githubLink} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <Button type="outline" fullWidth style={{ padding: "6px 0", fontSize: "12px" }}>💻 GitHub Repository</Button>
                </a>
                <a href={demoLink} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <Button type="outline" fullWidth style={{ padding: "6px 0", fontSize: "12px" }}>🌐 Running Demo</Button>
                </a>
                <a href={docLink} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <Button type="outline" fullWidth style={{ padding: "6px 0", fontSize: "12px" }}>📖 Developer Guides</Button>
                </a>
              </div>
            </div>
          </div>

          {/* IDE preview panels */}
          <div style={{ background: "var(--surface-1)", border: "1.5px solid var(--border-default)", borderRadius: "8px", overflow: "hidden" }}>
            {showAddFileForm ? (
              <form onSubmit={handleCreateFile} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <Input label="File Name (e.g. db.py)" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} required />
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Initial Code</label>
                  <textarea
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border-default)", borderRadius: "6px", padding: "10px", color: "var(--text-primary)", minHeight: "150px", fontFamily: "monospace", fontSize: "12px" }}
                  />
                </div>
                <Button type="primary" style={{ alignSelf: "flex-end" }}>Create</Button>
              </form>
            ) : activeFile ? (
              <div>
                <div style={{ background: "var(--surface-3)", padding: "8px 16px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-primary)", fontFamily: "monospace" }}>{activeFile.name}</span>
                </div>
                <textarea
                  value={activeFile.content}
                  onChange={(e) => handleUpdateFileCode(e.target.value)}
                  style={{ width: "100%", minHeight: "280px", background: "none", border: "none", padding: "16px", color: "#cbd5e1", fontFamily: "monospace", fontSize: "12px", outline: "none", resize: "vertical" }}
                />
              </div>
            ) : (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--light-text)" }}>Select file code.</div>
            )}
          </div>
        </div>
      )}

      {/* 👥 TAB: COLLABORATION & LOGS */}
      {activeTab === "collaboration" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "35px" }} className="builder-workspace-grid">
          <div>
            {/* Team list roster */}
            <h3 style={{ fontSize: "14px", color: "white", margin: "0 0 12px 0", fontWeight: "800" }}>Workspace Roster</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {teamMembers.map((m, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px" }}>
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: m.color,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: "750"
                    }}
                  >
                    {m.avatar}
                  </span>
                  <div>
                    <strong style={{ fontSize: "13px", color: "white", display: "block" }}>{m.name}</strong>
                    <span style={{ fontSize: "11px", color: "var(--light-text)" }}>{m.role}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity log timeline */}
            <div style={{ marginTop: "25px" }}>
              <h3 style={{ fontSize: "14px", color: "white", margin: "0 0 12px 0", fontWeight: "800" }}>Workspace Activity Timeline</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderLeft: "2px dashed var(--border)", paddingLeft: "15px", marginLeft: "6px" }}>
                {activityTimeline.map((act, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "-20px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />
                    <span style={{ color: "white", fontWeight: "700", fontSize: "12px" }}>{act.user}</span>{" "}
                    <span style={{ color: "var(--light-text)", fontSize: "11.5px" }}>{act.action}</span>
                    <span style={{ display: "block", color: "var(--light-text)", fontSize: "10px", marginTop: "2px" }}>{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: "14px", color: "white", margin: "0 0 12px 0", fontWeight: "800" }}>Sprint Dev Log</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", marginBottom: "15px" }}>
              {(project.comments || []).map((c) => (
                <div key={c.id} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong style={{ color: "var(--primary)" }}>{c.author}</strong>
                    <span style={{ color: "var(--light-text)", fontSize: "11px" }}>{c.date}</span>
                  </div>
                  <p style={{ margin: 0, color: "#cbd5e1", lineHeight: "1.45" }}>{c.text}</p>
                </div>
              ))}
            </div>

            {/* Post comment form */}
            <form onSubmit={handleAddComment} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Log dev updates or commentary..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                style={{ flex: 1, background: "#0f172a", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px 12px", color: "white", fontSize: "13px" }}
              />
              <Button type="primary" style={{ padding: "8px 16px" }}>Post Log</Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

export default React.memo(ProjectDetails);