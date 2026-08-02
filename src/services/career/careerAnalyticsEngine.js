// =======================================================
// careerAnalyticsEngine.js — Career Analytics Engine
// =======================================================
// Calculates application success rates, interview readiness %,
// salary progress, and overall placement readiness index.
// =======================================================

import applicationEngine from "./applicationEngine";
import resumeEngine from "./resumeEngine";
import interviewEngine from "./interviewEngine";

export const careerAnalyticsEngine = {
  /** Calculate complete career metrics breakdown */
  getMetrics: () => {
    const apps = applicationEngine.getApplications();
    const resumes = resumeEngine.getResumes();
    const mockHistory = interviewEngine.getMockHistory();

    const activeResume = resumes.find((r) => r.active) || resumes[0] || { atsScore: 85 };

    const totalApps = apps.length;
    const interviewingApps = apps.filter((a) => a.status === "Interviewing" || a.status === "Offer Received").length;
    const appSuccessRate = totalApps > 0 ? Math.round((interviewingApps / totalApps) * 100) : 0;

    const mockAvgScore = mockHistory.length > 0 ? Math.round(mockHistory.reduce((acc, m) => acc + m.score, 0) / mockHistory.length) : 85;

    const careerReadinessIndex = Math.round((activeResume.atsScore * 0.4) + (mockAvgScore * 0.4) + (appSuccessRate * 0.2));

    return {
      totalApplications: totalApps,
      interviewingCount: interviewingApps,
      appSuccessRate,
      activeATSScore: activeResume.atsScore,
      mockInterviewAvgScore: mockAvgScore,
      careerReadinessIndex,
    };
  },
};

export default careerAnalyticsEngine;
