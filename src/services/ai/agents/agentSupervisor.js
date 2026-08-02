/**
 * @file agentSupervisor.js
 * @description Supervisor monitoring running agents, detecting stalled steps, and limiting depth.
 */

import logger from "../../../utils/logger.js";

export const agentSupervisor = {
  /**
   * Evaluates active agent execution step safety.
   * @param {Object} executionState
   * @param {number} [maxDepth=5]
   * @returns {{ safe: boolean, error?: string }}
   */
  evaluateSafety: (executionState, maxDepth = 5) => {
    if (executionState && executionState.currentDepth > maxDepth) {
      logger.warn(`[AgentSupervisor] Max execution recursion depth (${maxDepth}) exceeded.`);
      return { safe: false, error: "Execution depth limit exceeded." };
    }
    return { safe: true };
  },
};

export default agentSupervisor;
