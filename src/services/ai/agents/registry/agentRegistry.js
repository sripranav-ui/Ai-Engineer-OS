// =======================================================
// agentRegistry.js — Agent Registry Singleton
// =======================================================

import logger from "../../../../utils/logger.js";

class AgentRegistry {
  constructor() {
    this.agentsMap = new Map();
  }

  /** Register specialized AI agent */
  registerAgent(agent) {
    if (!agent || !agent.id) throw new Error("Invalid agent instance.");
    this.agentsMap.set(agent.id, agent);
    logger.info(`[AgentRegistry] Registered agent "${agent.name}" (role: ${agent.role}).`);
  }

  /** Get registered agent by ID */
  getAgent(agentId) {
    return this.agentsMap.get(agentId) || null;
  }

  /** Find agent by role */
  getAgentByRole(role) {
    return Array.from(this.agentsMap.values()).find((a) => a.role === role) || null;
  }

  /** List all registered agents */
  getAllAgents() {
    return Array.from(this.agentsMap.values());
  }
}

export const agentRegistry = new AgentRegistry();
export default agentRegistry;
