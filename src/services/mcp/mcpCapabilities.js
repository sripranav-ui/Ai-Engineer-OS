/**
 * @file mcpCapabilities.js
 * @description Capability schemas for Model Context Protocol (MCP).
 */

export const MCP_CAPABILITY_TYPES = {
  TOOLS:     "tools",
  RESOURCES: "resources",
  PROMPTS:   "prompts",
};

export const createMCPCapabilityShape = (type, items = []) => ({
  type,
  items,
  registeredAt: new Date().toISOString(),
});

export default MCP_CAPABILITY_TYPES;
