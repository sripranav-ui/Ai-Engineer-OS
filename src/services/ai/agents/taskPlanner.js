/**
 * @file taskPlanner.js
 * @description Decomposes high-level goals into structured tasks and subtask dependency graphs.
 */

import logger from "../../../utils/logger.js";

export const taskPlanner = {
  /**
   * Decomposes goal into objectives and subtasks.
   * @param {Object} goal
   * @returns {Object[]} Subtasks list with required capabilities
   */
  planTasks: (goal) => {
    logger.info(`[TaskPlanner] Decomposing goal "${goal.id}" into subtask graph...`);

    return [
      {
        id: `task_${goal.id}_1`,
        title: "Perform deep research & context analysis",
        requiredCapability: "research",
        recommendedRole: "researcher",
        dependencies: [],
      },
      {
        id: `task_${goal.id}_2`,
        title: "Generate solution code & refactor architecture",
        requiredCapability: "code",
        recommendedRole: "coder",
        dependencies: [`task_${goal.id}_1`],
      },
      {
        id: `task_${goal.id}_3`,
        title: "Review security, performance & test code",
        requiredCapability: "review",
        recommendedRole: "reviewer",
        dependencies: [`task_${goal.id}_2`],
      },
    ];
  },
};

export default taskPlanner;
