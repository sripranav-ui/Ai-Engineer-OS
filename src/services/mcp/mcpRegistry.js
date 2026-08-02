/**
 * @file mcpRegistry.js
 * @description Registry of connected MCP servers and capabilities.
 */

import logger from "../../utils/logger.js";

class MCPRegistry {
  constructor() {
    this.serversMap = new Map();
  }

  registerServer(serverState) {
    if (!serverState || !serverState.id) throw new Error("Invalid MCP server state.");
    this.serversMap.set(serverState.id, serverState);
    logger.info(`[MCPRegistry] Registered MCP server "${serverState.name}" (${serverState.id}).`);
  }

  unregisterServer(serverId) {
    this.serversMap.delete(serverId);
    logger.info(`[MCPRegistry] Unregistered MCP server "${serverId}".`);
  }

  getServer(serverId) {
    return this.serversMap.get(serverId) || null;
  }

  getAllServers() {
    return Array.from(this.serversMap.values());
  }
}

export const mcpRegistry = new MCPRegistry();
export default mcpRegistry;
