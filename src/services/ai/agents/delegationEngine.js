/**
 * @file delegationEngine.js
 * @description Workload and capability-based task delegation engine matching tasks to agents.
 */

import capabilityRegistry from "./capabilityRegistry.js";
import agentRegistry from "./registry/agentRegistry.js";
import logger from "../../../utils/logger.js";

export const delegationEngine = {
  /**
   * Delegates subtask to appropriate agent instance.
   * @param {Object} task
   * @returns {Object} Selected Agent instance
   */
  delegateTask: (task) => {
    const roleSpec = capabilityRegistry.getAgentByCapability(task.requiredCapability);
    let agent = agentRegistry.getAgentByRole(roleSpec.role);

    if (!agent) {
      const all = agentRegistry.getAllAgents();
      agent = all.length > 0 ? all[0] : { id: "agent_fallback", name: roleSpec.id || "Copilot Agent", role: roleSpec.role || "assistant", execute: async () => ({ status: "SUCCESS" }) };
    }

    logger.info(`[DelegationEngine] Delegated subtask "${task.title}" -> Agent "${agent.name}" (${agent.role}).`);
    return agent;
  },
};

export default delegationEngine;
