// =======================================================
// toolLogger.js — Tool Execution Audit Logger
// =======================================================

const AUDIT_LOGS = [];

export const toolLogger = {
  logExecution: (toolId, args, context, status, resultOrError, durationMs) => {
    const entry = {
      id: `log_${Date.now()}`,
      toolId,
      args,
      agentId: context.agentId || "system",
      workspaceId: context.workspaceId || "default",
      status, // "SUCCESS" | "FAILED" | "TIMEOUT"
      durationMs,
      timestamp: new Date().toISOString(),
    };
    AUDIT_LOGS.unshift(entry);
    if (AUDIT_LOGS.length > 200) AUDIT_LOGS.pop();
  },

  getAuditLogs: () => [...AUDIT_LOGS],
};

export default toolLogger;
