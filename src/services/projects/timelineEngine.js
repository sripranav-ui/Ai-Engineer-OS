// =======================================================
// timelineEngine.js — Project Timeline & Milestone Engine
// =======================================================
// Manages project milestones, release dates, and visual
// timeline sequences.
// =======================================================

import storageService from "../storageService";

export const timelineEngine = {
  /** Get timeline milestones for a project */
  getMilestones: (projectId) => {
    try {
      const raw = storageService.get(`timeline_${projectId}`);
      return raw
        ? JSON.parse(raw)
        : [
            { id: "m1", title: "v1.0 Core App Shell Release", date: "2026-07-28", status: "completed" },
            { id: "m2", title: "v2.0 AI Intelligence Engine Release", date: "2026-08-01", status: "completed" },
            { id: "m3", title: "v3.0 Adaptive Learning & PM Engine Release", date: "2026-08-15", status: "in_progress" },
            { id: "m4", title: "v4.0 Full Commercial Launch", date: "2026-09-01", status: "planned" },
          ];
    } catch {
      return [];
    }
  },

  /** Add or update milestone */
  saveMilestone: (projectId, milestoneData) => {
    const list = timelineEngine.getMilestones(projectId);
    const exists = list.some((m) => m.id === milestoneData.id);

    let updated;
    if (exists) {
      updated = list.map((m) => (m.id === milestoneData.id ? { ...m, ...milestoneData } : m));
    } else {
      const newM = {
        id: `ms_${Date.now()}`,
        title: milestoneData.title || "New Milestone",
        date: milestoneData.date || new Date().toISOString().split("T")[0],
        status: milestoneData.status || "planned",
      };
      updated = [...list, newM];
    }

    storageService.set(`timeline_${projectId}`, JSON.stringify(updated));
    return updated;
  },
};

export default timelineEngine;
