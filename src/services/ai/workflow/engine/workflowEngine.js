/**
 * @file workflowEngine.js
 * @description Master Workflow Orchestrator managing workflow execution lifecycles.
 * Emits 'workflow.started', 'workflow.completed', 'workflow.failed',
 * 'workflow.cancelled', 'workflow.paused', and 'workflow.resumed' events via eventBus.
 */

import workflowRegistry from "../registry/workflowRegistry.js";
import executionQueue from "./executionQueue.js";
import workflowWorkerPool from "./workflowWorkerPool.js";
import workflowExecutor from "./workflowExecutor.js";
import checkpointManager from "./checkpointManager.js";
import WorkflowState from "../base/workflowState.js";
import eventBus from "../../../plugins/eventBus.js";
import workflowLogger from "../observability/workflowLogger.js";
import shortTermMemory from "../../memory/shortTermMemory.js";
import logger from "../../../../utils/logger.js";

const ACTIVE_INSTANCES = new Map();

export const workflowEngine = {
  /**
   * Enqueues and starts a workflow execution instance.
   * @param {string} workflowId - Registered workflow definition ID
   * @param {Object} [inputs={}] - Initial trigger inputs
   * @param {string} [priority='NORMAL'] - 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
   * @returns {Object} Execution instance handle ({ instanceId, status })
   */
  startWorkflow: (workflowId, inputs = {}, priority = "NORMAL") => {
    const workflowDef = workflowRegistry.getWorkflow(workflowId);
    if (!workflowDef) {
      throw new Error(`Workflow definition "${workflowId}" not found in registry.`);
    }

    const instanceId = `wf_inst_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const state = new WorkflowState(inputs);
    state.status = "QUEUED";

    const instance = {
      id: instanceId,
      workflowId,
      workflowDef,
      state,
      priority,
      startedAt: new Date().toISOString(),
    };

    ACTIVE_INSTANCES.set(instanceId, instance);
    executionQueue.enqueue({ instanceId, workflowId, priority, inputs });

    logger.info(`[WorkflowEngine] Enqueued workflow instance "${instanceId}" (${workflowDef.name}).`);

    // Trigger worker pool execution
    workflowWorkerPool.processNext(async (item) => {
      const inst = ACTIVE_INSTANCES.get(item.instanceId);
      if (!inst) return;

      inst.state.status = "RUNNING";
      shortTermMemory.setActiveWorkflow({ instanceId: inst.id, workflowName: inst.workflowDef.name, status: "RUNNING" });
      eventBus.publish("workflow.started", { instanceId: inst.id, workflowId: inst.workflowId });
      workflowLogger.logEvent(inst.id, "workflow.started", { workflowId: inst.workflowId });

      try {
        await workflowExecutor.executeGraph(inst, inst.workflowDef, inst.state);

        if (inst.state.status === "COMPLETED") {
          shortTermMemory.setActiveWorkflow({ instanceId: inst.id, workflowName: inst.workflowDef.name, status: "COMPLETED" });
          eventBus.publish("workflow.completed", { instanceId: inst.id, state: inst.state });
          workflowLogger.logEvent(inst.id, "workflow.completed", { state: inst.state });
          checkpointManager.clearCheckpoint(inst.id);
        } else if (inst.state.status === "PAUSED_APPROVAL") {
          shortTermMemory.setActiveWorkflow({ instanceId: inst.id, workflowName: inst.workflowDef.name, status: "PAUSED_APPROVAL" });
          eventBus.publish("workflow.paused", { instanceId: inst.id });
          workflowLogger.logEvent(inst.id, "workflow.paused");
          checkpointManager.saveCheckpoint(inst.id, inst.state);
        }
      } catch (err) {
        inst.state.status = "FAILED";
        shortTermMemory.setActiveWorkflow({ instanceId: inst.id, workflowName: inst.workflowDef.name, status: "FAILED" });
        eventBus.publish("workflow.failed", { instanceId: inst.id, error: err.message });
        workflowLogger.logEvent(inst.id, "workflow.failed", { error: err.message });
        checkpointManager.saveCheckpoint(inst.id, inst.state);
      }
    });

    return { instanceId, status: state.status };
  },

  /**
   * Resumes a paused workflow instance.
   * @param {string} instanceId
   */
  resumeWorkflow: (instanceId) => {
    const instance = ACTIVE_INSTANCES.get(instanceId);
    if (!instance) {
      throw new Error(`Active workflow instance "${instanceId}" not found.`);
    }

    instance.state.status = "RUNNING";
    shortTermMemory.setActiveWorkflow({ instanceId, workflowName: instance.workflowDef.name, status: "RUNNING" });
    eventBus.publish("workflow.resumed", { instanceId });
    workflowLogger.logEvent(instanceId, "workflow.resumed");

    // Re-trigger execution loop
    workflowExecutor.executeGraph(instance, instance.workflowDef, instance.state).then(() => {
      if (instance.state.status === "COMPLETED") {
        shortTermMemory.setActiveWorkflow({ instanceId, workflowName: instance.workflowDef.name, status: "COMPLETED" });
        eventBus.publish("workflow.completed", { instanceId: instance.id });
        workflowLogger.logEvent(instance.id, "workflow.completed");
        checkpointManager.clearCheckpoint(instance.id);
      }
    });
  },

  /**
   * Cancels a running or paused workflow instance.
   * @param {string} instanceId
   */
  cancelWorkflow: (instanceId) => {
    const instance = ACTIVE_INSTANCES.get(instanceId);
    if (instance) {
      instance.state.status = "CANCELLED";
      shortTermMemory.setActiveWorkflow(null);
      eventBus.publish("workflow.cancelled", { instanceId });
      workflowLogger.logEvent(instanceId, "workflow.cancelled");
      checkpointManager.clearCheckpoint(instanceId);
    }
  },

  /** Gets active instance handle by ID */
  getInstance: (instanceId) => ACTIVE_INSTANCES.get(instanceId) || null,
};

export default workflowEngine;
