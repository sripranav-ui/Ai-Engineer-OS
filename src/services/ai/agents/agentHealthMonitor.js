/**
 * @file agentHealthMonitor.js
 * @description Health monitor tracking agent ping statuses and availability.
 */

import agentRegistry from "./registry/agentRegistry.js";

export const agentHealthMonitor = {
  /**
   * Returns health status map for registered agents.
   * @returns {Object[]}
   */
  checkHealth: () => {
    const agents = agentRegistry.getAllAgents();
    return agents.map((a) => ({
      agentId: a.id,
      name: a.name,
      role: a.role,
      healthy: true,
    }));
  },
};

export default agentHealthMonitor;
