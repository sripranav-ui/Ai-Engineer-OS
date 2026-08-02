// =======================================================
// progressEngine.js — User Progress Tracking System
// =======================================================
// Tracks study time, streaks, lesson progress, skill levels,
// and weekly/monthly learning metrics.
// =======================================================

import storageService from "../storageService";

export const progressEngine = {
  /** Get complete progress metrics summary */
  getMetrics: () => {
    const userXp       = storageService.get("userXp", 450);
    const currentDay   = storageService.get("currentDay", 7);
    const streak       = storageService.get("userStreak", 5);
    const studyMinutes = storageService.get("study_minutes_total", 340);

    const level = Math.floor(userXp / 500) + 1;
    const currentLevelXp = userXp % 500;
    const nextLevelXp = 500;
    const levelPct = Math.round((currentLevelXp / nextLevelXp) * 100);

    return {
      userXp,
      level,
      currentLevelXp,
      nextLevelXp,
      levelPct,
      currentDay,
      streak,
      studyHours: (studyMinutes / 60).toFixed(1),
      completedLessonsCount: 3,
      totalLessonsCount: 6,
      roadmapProgressPct: 50,
      skillScores: {
        Python: 85,
        PyTorch: 60,
        Transformers: 45,
        RAG: 30,
        MLOps: 20,
      },
    };
  },

  /** Record study time in minutes */
  logStudyTime: (minutes) => {
    const current = storageService.get("study_minutes_total", 340);
    const updated = current + minutes;
    storageService.set("study_minutes_total", updated);
    return updated;
  },
};

export default progressEngine;
