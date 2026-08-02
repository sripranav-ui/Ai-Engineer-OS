// =======================================================
// sprintEngine.js — Sprint Management & Velocity Engine
// =======================================================
// Manages Sprint iterations, sprint planning, goals, story points,
// completed work, remaining work, velocity tracking.
// =======================================================

import storageService from "../storageService";

export const sprintEngine = {
  /** Get active or planned sprints for a project */
  getSprints: (projectId) => {
    try {
      const raw = storageService.get(`sprints_${projectId}`);
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: `sprint_1`,
              projectId,
              name: "Sprint 1: Core Framework & AI Intelligence",
              goal: "Deliver foundation app shell, AI Engine, and adaptive learning engine.",
              startDate: new Date(Date.now() - 604800000).toISOString(),
              endDate: new Date(Date.now() + 604800000).toISOString(),
              status: "active", // "planned" | "active" | "completed"
              targetStoryPoints: 40,
              completedStoryPoints: 28,
            },
          ];
    } catch {
      return [];
    }
  },

  /** Create new sprint */
  createSprint: (projectId, data) => {
    const list = sprintEngine.getSprints(projectId);
    const newSprint = {
      id: `sprint_${Date.now()}`,
      projectId,
      name: data.name || `Sprint ${list.length + 1}`,
      goal: data.goal || "",
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 1209600000).toISOString(),
      status: "planned",
      targetStoryPoints: data.targetStoryPoints || 30,
      completedStoryPoints: 0,
    };
    const updated = [newSprint, ...list];
    storageService.set(`sprints_${projectId}`, JSON.stringify(updated));
    return newSprint;
  },

  /** Get velocity stats across past completed sprints */
  getVelocity: (projectId) => {
    const sprints = sprintEngine.getSprints(projectId);
    const completed = sprints.filter((s) => s.status === "completed" || s.status === "active");
    if (completed.length === 0) return { avgVelocity: 25, totalStoryPoints: 28 };

    const totalPts = completed.reduce((acc, s) => acc + (s.completedStoryPoints || 0), 0);
    const avg = Math.round(totalPts / completed.length);
    return { avgVelocity: avg, totalStoryPoints: totalPts };
  },
};

export default sprintEngine;
