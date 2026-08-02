/**
 * @file executionMonitor.js
 * @description Telemetry monitor tracking active, completed, and failed agent tasks.
 */

const MONITOR_STATE = {
  activeTasks: 0,
  completedTasks: 0,
  failedTasks: 0,
};

export const executionMonitor = {
  trackStart: () => {
    MONITOR_STATE.activeTasks++;
  },

  trackEnd: (success = true) => {
    MONITOR_STATE.activeTasks = Math.max(0, MONITOR_STATE.activeTasks - 1);
    if (success) MONITOR_STATE.completedTasks++;
    else MONITOR_STATE.failedTasks++;
  },

  getMetrics: () => ({ ...MONITOR_STATE }),
};

export default executionMonitor;
