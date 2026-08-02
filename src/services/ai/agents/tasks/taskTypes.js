// =======================================================
// taskTypes.js — Task Status & Lifecycle Enums
// =======================================================

export const TASK_STATUS = {
  QUEUED:    "QUEUED",
  PLANNING:  "PLANNING",
  RUNNING:   "RUNNING",
  DELEGATED: "DELEGATED",
  COMPLETED: "COMPLETED",
  FAILED:    "FAILED",
  CANCELLED: "CANCELLED",
};

export const createTaskShape = (data = {}) => ({
  id:          data.id || `task_${Date.now()}`,
  title:       data.title || "Untitled Agent Task",
  description: data.description || "",
  goal:        data.goal || "",
  status:      data.status || TASK_STATUS.QUEUED,
  assignedTo:  data.assignedTo || null,
  subtasks:    data.subtasks || [],
  result:      data.result || null,
  error:       data.error || null,
  createdAt:   new Date().toISOString(),
});
