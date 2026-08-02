// =======================================================
// activityEngine.js — Project Activity Feed & Audit Log
// =======================================================
// Records and retrieves chronological activity events for
// projects (task changes, docs updated, milestones reached).
// =======================================================

import storageService from "../storageService";

export const activityEngine = {
  /** Get activity log events for a project */
  getActivityLog: (projectId) => {
    try {
      const raw = storageService.get(`activity_${projectId}`);
      return raw
        ? JSON.parse(raw)
        : [
            { id: "act_1", type: "TASK_COMPLETED", text: "Task 'Centralized Navigation' completed", timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: "act_2", type: "DOC_UPDATED", text: "Updated 'System Architecture' documentation", timestamp: new Date(Date.now() - 7200000).toISOString() },
          ];
    } catch {
      return [];
    }
  },

  /** Log a new activity event */
  logEvent: (projectId, type, text) => {
    const list = activityEngine.getActivityLog(projectId);
    const event = {
      id: `act_${Date.now()}`,
      type,
      text,
      timestamp: new Date().toISOString(),
    };
    const updated = [event, ...list.slice(0, 49)];
    storageService.set(`activity_${projectId}`, JSON.stringify(updated));
    return event;
  },
};

export default activityEngine;
