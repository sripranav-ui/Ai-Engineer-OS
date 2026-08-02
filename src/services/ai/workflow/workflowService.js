/**
 * @file workflowService.js
 * @description Single public facade API for the Workflow & Automation System.
 * Hides internal engine details and decouples OS modules from engine internals.
 */

import workflowEngine from "./engine/workflowEngine.js";
import workflowRegistry from "./registry/workflowRegistry.js";
import workflowLogger from "./observability/workflowLogger.js";
import logger from "../../../utils/logger.js";

export const workflowService = {
  /**
   * Starts a workflow execution instance by definition ID.
   * @param {string} workflowId - Registered workflow definition ID
   * @param {Object} [inputs={}] - Initial trigger inputs
   * @param {string} [priority='NORMAL'] - 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
   * @returns {Object} ({ instanceId, status })
   */
  runWorkflow: (workflowId, inputs = {}, priority = "NORMAL") => {
    logger.info(`[WorkflowService] Unified API call: runWorkflow("${workflowId}")`);
    return workflowEngine.startWorkflow(workflowId, inputs, priority);
  },

  /**
   * Pauses an active workflow instance.
   * @param {string} instanceId
   */
  pauseWorkflow: (instanceId) => {
    const inst = workflowEngine.getInstance(instanceId);
    if (inst && inst.state) {
      inst.state.status = "PAUSED_APPROVAL";
    }
  },

  /**
   * Resumes a paused workflow instance.
   * @param {string} instanceId
   */
  resumeWorkflow: (instanceId) => {
    logger.info(`[WorkflowService] Unified API call: resumeWorkflow("${instanceId}")`);
    return workflowEngine.resumeWorkflow(instanceId);
  },

  /**
   * Cancels a running or paused workflow instance.
   * @param {string} instanceId
   */
  cancelWorkflow: (instanceId) => {
    logger.info(`[WorkflowService] Unified API call: cancelWorkflow("${instanceId}")`);
    return workflowEngine.cancelWorkflow(instanceId);
  },

  /**
   * Returns current status and telemetry of a workflow instance.
   * @param {string} instanceId
   * @returns {Object|null}
   */
  getWorkflowStatus: (instanceId) => {
    const inst = workflowEngine.getInstance(instanceId);
    if (!inst) return null;
    return {
      instanceId: inst.id,
      workflowId: inst.workflowId,
      status: inst.state.status,
      completedSteps: inst.state.completedSteps,
      startedAt: inst.startedAt,
      logs: workflowLogger.getLogsForInstance(instanceId),
    };
  },

  /**
   * Lists all available workflow definitions.
   * @returns {Object[]}
   */
  listWorkflows: () => {
    return workflowRegistry.getAllWorkflows();
  },
};

export default workflowService;
