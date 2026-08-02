/**
 * @file agentTelemetry.js
 * @description Performance telemetry recorder tracking execution latency per agent role.
 */

import metricsTracker from "./observability/metricsTracker.js";

export const agentTelemetry = {
  record: (agentId, status, durationMs) => {
    metricsTracker.recordTask(status, durationMs);
  },

  getSummary: () => {
    return metricsTracker.getMetrics();
  },
};

export default agentTelemetry;
