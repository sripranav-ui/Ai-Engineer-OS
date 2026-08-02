/**
 * @file workflowLogger.js
 * @description Telemetry logger and audit recorder for workflow executions.
 */

import logger from "../../../../utils/logger.js";

const AUDIT_LOGS = [];

export const workflowLogger = {
  /**
   * Logs a workflow event entry into the audit trail.
   * @param {string} instanceId - Workflow execution instance ID
   * @param {string} event - Event name (e.g. 'workflow.started', 'node.completed')
   * @param {Object} [details={}] - Additional details payload
   */
  logEvent: (instanceId, event, details = {}) => {
    const entry = {
      id: `wf_log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      instanceId,
      event,
      details,
      timestamp: new Date().toISOString(),
    };
    AUDIT_LOGS.unshift(entry);
    if (AUDIT_LOGS.length > 300) AUDIT_LOGS.pop();

    logger.info(`[WorkflowLogger] Instance "${instanceId}" event "${event}" recorded.`);
    return entry;
  },

  /**
   * Gets audit logs for a specific workflow instance.
   * @param {string} instanceId
   * @returns {Object[]}
   */
  getLogsForInstance: (instanceId) => {
    return AUDIT_LOGS.filter((l) => l.instanceId === instanceId);
  },

  /**
   * Gets all execution audit logs.
   * @returns {Object[]}
   */
  getAllLogs: () => [...AUDIT_LOGS],
};

export default workflowLogger;
