/**
 * @file mcpServerManager.js
 * @description Master Server Manager handling MCP server connections, discovery, and tool invocations.
 */

import mcpRegistry from "./mcpRegistry.js";
import { MCPClient } from "./mcpClient.js";
import logger from "../../utils/logger.js";

export const mcpServerManager = {
  /**
   * Connects to a Model Context Protocol (MCP) server.
   * @param {Object} config - ({ id, name, uri })
   */
  connectServer: async (config) => {
    logger.info(`[MCPServerManager] Connecting to server "${config.name}" (${config.id})...`);
    const client = new MCPClient({ serverId: config.id, transport: null });
    await client.initialize();

    const serverState = {
      id: config.id,
      name: config.name,
      uri: config.uri,
      client,
      connectedAt: new Date().toISOString(),
    };

    mcpRegistry.registerServer(serverState);
    return serverState;
  },

  /** Disconnects an MCP server */
  disconnectServer: async (serverId) => {
    logger.info(`[MCPServerManager] Disconnecting server "${serverId}".`);
    mcpRegistry.unregisterServer(serverId);
  },

  /** Lists all connected MCP servers */
  listServers: () => {
    return mcpRegistry.getAllServers();
  },

  /** Lists capabilities for a connected server */
  listCapabilities: async (serverId) => {
    const server = mcpRegistry.getServer(serverId);
    if (!server) throw new Error(`MCP server "${serverId}" not found.`);
    return {
      tools: await server.client.listTools(),
      resources: await server.client.listResources(),
      prompts: await server.client.listPrompts(),
    };
  },

  /** Lists tools across connected servers */
  listTools: async (serverId) => {
    const server = mcpRegistry.getServer(serverId);
    return server ? await server.client.listTools() : [];
  },

  /** Invokes a tool on a connected server */
  invokeTool: async (serverId, toolName, args = {}) => {
    const server = mcpRegistry.getServer(serverId);
    if (!server) throw new Error(`MCP server "${serverId}" not found.`);
    return await server.client.invokeTool(toolName, args);
  },
};

export default mcpServerManager;
