/**
 * @file executionPlanner.js
 * @description Schedules sequential and parallel execution steps for multi-agent workflows.
 */

export const executionPlanner = {
  /**
   * Generates execution steps schedule.
   * @param {Object[]} tasks
   * @returns {Object[]}
   */
  createExecutionPlan: (tasks) => {
    return tasks.map((t, idx) => ({
      step: idx + 1,
      task: t,
      executionMode: t.dependencies.length > 0 ? "SEQUENTIAL" : "PARALLEL",
    }));
  },
};

export default executionPlanner;
