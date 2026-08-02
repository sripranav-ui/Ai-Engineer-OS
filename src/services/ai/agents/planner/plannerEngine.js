// =======================================================
// plannerEngine.js — Subtask Decomposition & Goal Planner
// =======================================================

import logger from "../../../../utils/logger.js";

export const plannerEngine = {
  /**
   * Decompose user goal into structured subtask steps with agent assignments
   * @param {string} goal - high-level goal statement
   */
  planGoal: (goal = "") => {
    logger.info(`[PlannerEngine] Generating execution plan for goal: "${goal}"...`);

    const gLower = goal.toLowerCase();
    const subtasks = [];

    if (gLower.includes("project") || gLower.includes("kanban")) {
      subtasks.push({
        id: `sub_${Date.now()}_1`,
        title: "Analyze project scope & requirements",
        recommendedRole: "pm",
      });
      subtasks.push({
        id: `sub_${Date.now()}_2`,
        title: "Generate starter tasks and Kanban board",
        recommendedRole: "pm",
      });
    }

    if (gLower.includes("code") || gLower.includes("refactor") || gLower.includes("bug")) {
      subtasks.push({
        id: `sub_${Date.now()}_3`,
        title: "Review codebase files & identify edits",
        recommendedRole: "coder",
      });
    }

    if (subtasks.length === 0) {
      subtasks.push({
        id: `sub_${Date.now()}_default`,
        title: "Execute user request with general AI copilot",
        recommendedRole: "coder",
      });
    }

    return {
      goal,
      estimatedSteps: subtasks.length,
      subtasks,
      createdAt: new Date().toISOString(),
    };
  },
};

export default plannerEngine;
