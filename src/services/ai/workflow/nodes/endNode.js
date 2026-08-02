/**
 * @file endNode.js
 * @description Termination node for workflow execution graphs.
 * Aggregates final workflow outputs and marks state as COMPLETED.
 */

import BaseWorkflowNode from "../base/baseNode.js";

export class EndNode extends BaseWorkflowNode {
  /**
   * Constructs an EndNode instance.
   * @param {Object} options
   * @param {string} options.id - Node instance ID
   * @param {string} [options.label='End Workflow']
   * @param {Object} [options.config={}]
   */
  constructor({ id, label = "End Workflow", config = {} }) {
    super({ id, type: "end", label, config });
  }

  /**
   * Executes the end node, finalizing outputs.
   * @param {Object} inputs - Inputs passed to end node
   * @param {Object} state - WorkflowState instance
   * @returns {Promise<Object>} Final aggregated payload
   */
  async execute(inputs = {}, state) {
    if (state) {
      state.status = "COMPLETED";
    }

    return {
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      finalOutputs: inputs,
    };
  }
}

export default EndNode;
