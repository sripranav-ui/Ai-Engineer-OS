/**
 * @file mcpKnowledgeProvider.js
 * @description Provider adapter searching Model Context Protocol (MCP) server resources.
 */

import BaseRAGProvider from "./baseRAGProvider.js";
import mcpServerManager from "../../../mcp/mcpServerManager.js";

export class MCPKnowledgeProvider extends BaseRAGProvider {
  constructor() {
    super({ id: "mcp_knowledge", name: "MCP Server Resources Provider" });
  }

  async search(query, options = {}) {
    const servers = mcpServerManager.listServers();
    const results = [];
    servers.forEach((s) => {
      results.push({
        id: `mcp_res_${s.id}`,
        text: `Resource from MCP Server ${s.name}`,
        sourceId: s.id,
        sourceType: "MCPServer",
        provider: this.id,
        score: 65,
      });
    });
    return results;
  }
}

export default MCPKnowledgeProvider;
