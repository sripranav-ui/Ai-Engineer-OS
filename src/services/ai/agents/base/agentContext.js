// =======================================================
// agentContext.js — Execution Context Metadata
// =======================================================

export const createAgentContext = (data = {}) => ({
  workspaceId: data.workspaceId || "default",
  currentRoute: data.currentRoute || "/",
  activeProject: data.activeProject || null,
  systemPrompt: data.systemPrompt || "",
  timestamp: new Date().toISOString(),
});

export default createAgentContext;
