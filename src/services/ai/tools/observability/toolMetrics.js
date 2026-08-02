// =======================================================
// toolMetrics.js — Real-Time Tool Performance Telemetry
// =======================================================

const METRICS = {
  totalCalls: 0,
  successCount: 0,
  failureCount: 0,
  totalDurationMs: 0,
};

export const toolMetrics = {
  record: (status, durationMs) => {
    METRICS.totalCalls++;
    if (status === "SUCCESS") METRICS.successCount++;
    else METRICS.failureCount++;
    METRICS.totalDurationMs += durationMs;
  },

  getMetrics: () => ({
    ...METRICS,
    avgDurationMs: METRICS.totalCalls > 0 ? Math.round(METRICS.totalDurationMs / METRICS.totalCalls) : 0,
    successRate: METRICS.totalCalls > 0 ? Math.round((METRICS.successCount / METRICS.totalCalls) * 100) : 100,
  }),
};

export default toolMetrics;
