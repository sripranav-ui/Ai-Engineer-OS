import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from "react";
import { WorkspaceManagerContext } from "./WorkspaceManagerContext";
import projectEngine from "../services/projects/projectEngine";
import taskEngine from "../services/projects/taskEngine";
import sprintEngine from "../services/projects/sprintEngine";
import docEngine from "../services/projects/docEngine";
import timelineEngine from "../services/projects/timelineEngine";
import templateEngine from "../services/projects/templateEngine";
import activityEngine from "../services/projects/activityEngine";
import aiProjectHelper from "../services/projects/aiProjectHelper";

export const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Load projects list when workspace changes
  useEffect(() => {
    const list = projectEngine.getProjects(activeWorkspaceId);
    setProjects(list);
    if (list.length > 0 && !activeProjectId) {
      setActiveProjectId(list[0].id);
    }
  }, [activeWorkspaceId, activeProjectId]);

  // Load tasks when active project changes
  useEffect(() => {
    if (activeProjectId) {
      const taskList = taskEngine.getProjectTasks(activeProjectId, activeWorkspaceId);
      setTasks(taskList);
    }
  }, [activeProjectId, activeWorkspaceId]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  // Project CRUD
  const createProject = useCallback(
    (data) => {
      const newProj = projectEngine.createProject(data, activeWorkspaceId);
      const updated = projectEngine.getProjects(activeWorkspaceId);
      setProjects(updated);
      setActiveProjectId(newProj.id);
      activityEngine.logEvent(newProj.id, "PROJECT_CREATED", `Created project "${newProj.title}"`);
      return newProj;
    },
    [activeWorkspaceId]
  );

  const createFromTemplate = useCallback(
    (templateId, customTitle) => {
      const newProj = templateEngine.createFromTemplate(templateId, customTitle, activeWorkspaceId);
      const updated = projectEngine.getProjects(activeWorkspaceId);
      setProjects(updated);
      setActiveProjectId(newProj.id);
      activityEngine.logEvent(newProj.id, "PROJECT_CREATED", `Created project "${newProj.title}" from template`);
      return newProj;
    },
    [activeWorkspaceId]
  );

  // Task CRUD & Kanban operations
  const createTask = useCallback(
    (taskData) => {
      if (!activeProjectId) return;
      const newTask = taskEngine.createTask(activeProjectId, taskData, activeWorkspaceId);
      const updatedTasks = taskEngine.getProjectTasks(activeProjectId, activeWorkspaceId);
      setTasks(updatedTasks);
      activityEngine.logEvent(activeProjectId, "TASK_CREATED", `Created task "${newTask.title}"`);
      return newTask;
    },
    [activeProjectId, activeWorkspaceId]
  );

  const moveTaskStatus = useCallback(
    (taskId, nextStatus) => {
      if (!activeProjectId) return;
      const updatedTasks = taskEngine.moveTaskStatus(activeProjectId, taskId, nextStatus, activeWorkspaceId);
      setTasks(updatedTasks);
      activityEngine.logEvent(activeProjectId, "TASK_MOVED", `Moved task to ${nextStatus}`);
    },
    [activeProjectId, activeWorkspaceId]
  );

  const value = useMemo(
    () => ({
      projects,
      activeProject,
      activeProjectId,
      setActiveProjectId,
      createProject,
      createFromTemplate,
      templates: templateEngine.getTemplates(),
      tasks,
      createTask,
      moveTaskStatus,
      sprints: activeProjectId ? sprintEngine.getSprints(activeProjectId) : [],
      velocity: activeProjectId ? sprintEngine.getVelocity(activeProjectId) : { avgVelocity: 25 },
      docs: activeProjectId ? docEngine.getDocs(activeProjectId) : [],
      saveDoc: (docData) => activeProjectId && docEngine.saveDoc(activeProjectId, docData),
      milestones: activeProjectId ? timelineEngine.getMilestones(activeProjectId) : [],
      activityLog: activeProjectId ? activityEngine.getActivityLog(activeProjectId) : [],
      aiHelper: aiProjectHelper,
    }),
    [projects, activeProject, activeProjectId, tasks, createProject, createFromTemplate, createTask, moveTaskStatus]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within a <ProjectsProvider>");
  return ctx;
}

export default ProjectsContext;
