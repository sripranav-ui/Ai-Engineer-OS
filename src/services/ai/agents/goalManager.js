/**
 * @file goalManager.js
 * @description High-level user goal ingestion and state lifecycle tracker.
 */

import logger from "../../../utils/logger.js";

const GOALS = new Map();

export const goalManager = {
  /**
   * Registers and initializes a new user goal.
   * @param {string} goalText
   * @param {Object} [metadata={}]
   * @returns {Object} Goal instance
   */
  createGoal: (goalText, metadata = {}) => {
    const id = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const goal = {
      id,
      goalText,
      status: "INGESTED", // "INGESTED" | "PLANNING" | "EXECUTING" | "COMPLETED" | "FAILED"
      metadata,
      createdAt: new Date().toISOString(),
    };
    GOALS.set(id, goal);
    logger.info(`[GoalManager] Created goal "${id}": "${goalText}"`);
    return goal;
  },

  updateStatus: (goalId, status) => {
    const goal = GOALS.get(goalId);
    if (goal) {
      goal.status = status;
    }
  },

  getGoal: (goalId) => GOALS.get(goalId) || null,
};

export default goalManager;
