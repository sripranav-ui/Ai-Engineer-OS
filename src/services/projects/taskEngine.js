// =======================================================
// taskEngine.js — Kanban & Task Management Engine
// =======================================================
// Manages Kanban columns, task states, status transitions,
// subtasks, checklists, priorities, and estimates.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

const TASKS_STORAGE_KEY = "pm_tasks_registry";

export const KANBAN_COLUMNS = [
  { id: "backlog",     title: "Backlog",     color: "var(--text-tertiary)" },
  { id: "todo",        title: "Todo",        color: "var(--info)" },
  { id: "in_progress", title: "In Progress", color: "var(--warning)" },
  { id: "review",      title: "Review",      color: "var(--accent)" },
  { id: "testing",     title: "Testing",     color: "#a855f7" },
  { id: "completed",   title: "Completed",   color: "var(--success)" },
];

const DEFAULT_TASKS = [
  {
    id: "task_1",
    projectId: "proj_1",
    title: "Implement Centralized Navigation Architecture",
    description: "Refactor route registry in config/navigation.js for single source of truth.",
    status: "completed",
    priority: "High",
    dueDate: "2026-07-30",
    estHours: 4,
    actualHours: 3.5,
    subtasks: [
      { id: "st_1", text: "Extract NAV_ROUTES array", done: true },
      { id: "st_2", text: "Wire Sidebar & CommandPalette", done: true },
    ],
    labels: ["Frontend", "Refactor"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_2",
    projectId: "proj_1",
    title: "Build Multi-Track Adaptive Learning Engine",
    description: "Support modules, topics, spaced repetition flashcards, and quizzes.",
    status: "in_progress",
    priority: "Urgent",
    dueDate: "2026-08-05",
    estHours: 8,
    actualHours: 4,
    subtasks: [
      { id: "st_3", text: "Create flashcardEngine with SuperMemo SM-2", done: true },
      { id: "st_4", text: "Create quizEngine with evaluation logic", done: true },
    ],
    labels: ["Learning", "Core Engine"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "task_3",
    projectId: "proj_1",
    title: "Integrate Project Management Engine with AI",
    description: "Add automated feature breakdown, effort estimation, and project health checks.",
    status: "todo",
    priority: "High",
    dueDate: "2026-08-10",
    estHours: 6,
    actualHours: 0,
    subtasks: [],
    labels: ["AI Integration", "PM"],
    createdAt: new Date().toISOString(),
  },
];

export const taskEngine = {
  /** Get tasks for a given project */
  getProjectTasks: (projectId, workspaceId = "default") => {
    try {
      const raw = storageService.get(`${workspaceId}_${projectId}_${TASKS_STORAGE_KEY}`);
      return raw ? JSON.parse(raw) : DEFAULT_TASKS.filter((t) => t.projectId === projectId || !projectId);
    } catch {
      return DEFAULT_TASKS;
    }
  },

  /** Save tasks for a project */
  saveProjectTasks: (projectId, tasks, workspaceId = "default") => {
    try {
      storageService.set(`${workspaceId}_${projectId}_${TASKS_STORAGE_KEY}`, JSON.stringify(tasks));
    } catch (err) {
      logger.error("[TaskEngine] Error saving tasks:", err);
    }
  },

  /** Move task to a new Kanban column status */
  moveTaskStatus: (projectId, taskId, nextStatus, workspaceId = "default") => {
    const tasks = taskEngine.getProjectTasks(projectId, workspaceId);
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t));
    taskEngine.saveProjectTasks(projectId, updated, workspaceId);
    logger.info(`[TaskEngine] Moved task ${taskId} -> ${nextStatus}`);
    return updated;
  },

  /** Add new task */
  createTask: (projectId, data, workspaceId = "default") => {
    const tasks = taskEngine.getProjectTasks(projectId, workspaceId);
    const newTask = {
      id: `task_${Date.now()}`,
      projectId,
      title: data.title || "New Task",
      description: data.description || "",
      status: data.status || "todo",
      priority: data.priority || "Medium",
      dueDate: data.dueDate || null,
      estHours: data.estHours || 2,
      actualHours: 0,
      subtasks: data.subtasks || [],
      labels: data.labels || ["Feature"],
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    taskEngine.saveProjectTasks(projectId, updated, workspaceId);
    return newTask;
  },

  /** Toggle subtask completed status */
  toggleSubtask: (projectId, taskId, subtaskId, workspaceId = "default") => {
    const tasks = taskEngine.getProjectTasks(projectId, workspaceId);
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const subtasks = t.subtasks.map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st));
      return { ...t, subtasks };
    });
    taskEngine.saveProjectTasks(projectId, updated, workspaceId);
    return updated;
  },
};

export default taskEngine;
