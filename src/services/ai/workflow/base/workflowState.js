/**
 * @file workflowState.js
 * @description Encapsulates runtime execution state, global/local variables,
 * node output dictionaries, and checkpoint snapshots for running workflows.
 */

import logger from "../../../../utils/logger.js";

export class WorkflowState {
  /**
   * Constructs a WorkflowState instance.
   * @param {Object} [initialVariables={}] - Initial variables dictionary
   */
  constructor(initialVariables = {}) {
    this.variables = { ...initialVariables };
    this.nodeOutputs = {};
    this.completedSteps = [];
    this.status = "QUEUED"; // "QUEUED" | "RUNNING" | "PAUSED_APPROVAL" | "COMPLETED" | "FAILED"
    this.checkpoints = [];
  }

  /**
   * Sets a variable in the workflow state.
   * @param {string} key
   * @param {any} value
   */
  setVariable(key, value) {
    this.variables[key] = value;
  }

  /**
   * Gets a variable from the workflow state.
   * @param {string} key
   * @param {any} [fallback=null]
   * @returns {any}
   */
  getVariable(key, fallback = null) {
    return this.variables[key] !== undefined ? this.variables[key] : fallback;
  }

  /**
   * Records output payload from a completed node step.
   * @param {string} nodeId
   * @param {Object} output
   */
  recordNodeOutput(nodeId, output) {
    this.nodeOutputs[nodeId] = output;
    if (!this.completedSteps.includes(nodeId)) {
      this.completedSteps.push(nodeId);
    }
  }

  /**
   * Creates a state checkpoint snapshot.
   * @returns {Object} Checkpoint snapshot
   */
  createCheckpoint() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      variables: { ...this.variables },
      completedSteps: [...this.completedSteps],
      status: this.status,
    };
    this.checkpoints.push(snapshot);
    logger.info(`[WorkflowState] Checkpoint created. Total completed steps: ${this.completedSteps.length}`);
    return snapshot;
  }
}

export default WorkflowState;
