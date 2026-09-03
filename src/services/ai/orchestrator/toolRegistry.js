/**
 * @file toolRegistry.js
 * @description Tool Registry & Execution Interface for AI Engineer OS Orchestration Layer.
 * Defines tool schemas and provides handlers for agent execution.
 */

import eventBus from "../../plugins/eventBus.js";
import retrievalService from "../rag/retrievalService.js";

export class ToolRegistryService {
  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  registerDefaultTools() {
    // 1. insert_code
    this.registerTool({
      name: "insert_code",
      description: "Insert generated code directly into Sacred Studio active file buffer",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "Code content to insert" },
          language: { type: "string", description: "Language tag (e.g. python, typescript)" },
          filename: { type: "string", description: "Target filename" },
        },
        required: ["code"],
      },
      execute: async (args) => {
        const payload = {
          id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          code: args.code,
          language: args.language || "python",
          filename: args.filename || "generated.py",
          timestamp: new Date().toISOString(),
        };
        eventBus.emit("INSERT_CODE_STUDIO", payload);
        return { success: true, message: "Code inserted into Studio" };
      },
    });

    // 2. search_knowledge
    this.registerTool({
      name: "search_knowledge",
      description: "Search local vector memory for relevant knowledge chunks",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query string" },
          topK: { type: "number", description: "Number of top chunks to retrieve" },
        },
        required: ["query"],
      },
      execute: async (args) => {
        const res = await retrievalService.search(args.query, { topK: args.topK || 5, mode: "hybrid" });
        return { success: true, chunksCount: res.chunks.length, chunks: res.chunks };
      },
    });

    // 3. create_file (Architecture placeholder)
    this.registerTool({
      name: "create_file",
      description: "Create a new file in workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path relative to workspace" },
          content: { type: "string", description: "File content" },
        },
        required: ["path", "content"],
      },
      execute: async (args) => {
        return { success: true, path: args.path, status: "File created in workspace queue" };
      },
    });

    // 4. edit_file (Architecture placeholder)
    this.registerTool({
      name: "edit_file",
      description: "Edit existing file in workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Target file path" },
          changes: { type: "string", description: "Diff or content update" },
        },
        required: ["path", "changes"],
      },
      execute: async (args) => {
        return { success: true, path: args.path, status: "File edited successfully" };
      },
    });

    // 5. search_project (Architecture placeholder)
    this.registerTool({
      name: "search_project",
      description: "Search source code across project files",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term or regex" },
        },
        required: ["query"],
      },
      execute: async (args) => {
        return { success: true, query: args.query, matches: [] };
      },
    });

    // 6. run_terminal (Architecture placeholder)
    this.registerTool({
      name: "run_terminal",
      description: "Execute CLI command in Studio terminal",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "CLI command string" },
        },
        required: ["command"],
      },
      execute: async (args) => {
        return { success: true, command: args.command, stdout: `Executed: ${args.command}` };
      },
    });
  }

  registerTool(toolDefinition) {
    if (!toolDefinition || !toolDefinition.name) {
      throw new Error("Invalid tool definition: missing 'name'.");
    }
    this.tools.set(toolDefinition.name, toolDefinition);
  }

  getTool(name) {
    return this.tools.get(name) || null;
  }

  listTools() {
    return Array.from(this.tools.values()).map(({ name, description, parameters }) => ({
      name,
      description,
      parameters,
    }));
  }

  async executeTool(name, args = {}) {
    const tool = this.getTool(name);
    if (!tool || typeof tool.execute !== "function") {
      throw new Error(`Tool '${name}' not found or has no execute handler.`);
    }
    return await tool.execute(args);
  }
}

export const toolRegistryService = new ToolRegistryService();
export default toolRegistryService;
