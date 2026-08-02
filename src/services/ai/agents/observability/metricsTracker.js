// =======================================================
// metricsTracker.js — Multi-Agent Execution Telemetry
// =======================================================

const METRICS = {
  totalTasks: 0,
  completedTasks: 0,
  failedTasks: 0,
  totalDurationMs: 0,
};

export const metricsTracker = {
  recordTask: (status, durationMs) => {
    METRICS.totalTasks++;
    if (status === "COMPLETED") METRICS.completedTasks++;
    else if (status === "FAILED") METRICS.failedTasks++;
    METRICS.totalDurationMs += durationMs;
  },

  getMetrics: () => ({
    ...METRICS,
    avgDurationMs: METRICS.totalTasks > 0 ? Math.round(METRICS.totalDurationMs / METRICS.totalTasks) : 0,
    successRate: METRICS.totalTasks > 0 ? Math.round((METRICS.completedTasks / METRICS.totalTasks) * 100) : 100,
  }),
};

export default metricsTracker;
