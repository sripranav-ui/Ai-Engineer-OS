// =======================================================
// executionContext.js — Tool Execution Context Shape
// =======================================================

export const createExecutionContext = (data = {}) => ({
  agentId:     data.agentId || "system",
  workspaceId: data.workspaceId || "default",
  userRole:    data.userRole || "STUDENT",
  timestamp:   data.timestamp || new Date().toISOString(),
  permissions: data.permissions || ["*"],
});

export default createExecutionContext;
