/**
 * @file startNode.js
 * @description Entry point node for workflow execution graphs.
 * Ingests initial trigger payloads and initializes workflow context variables.
 */

import BaseWorkflowNode from "../base/baseNode.js";

export class StartNode extends BaseWorkflowNode {
  /**
   * Constructs a StartNode instance.
   * @param {Object} options
   * @param {string} options.id - Node instance ID
   * @param {string} [options.label='Start Workflow']
   * @param {Object} [options.config={}]
   */
  constructor({ id, label = "Start Workflow", config = {} }) {
    super({ id, type: "start", label, config });
  }

  /**
   * Executes the start node, merging trigger payload into workflow state.
   * @param {Object} inputs - Initial trigger inputs
   * @param {Object} state - WorkflowState instance
   * @returns {Promise<Object>} Output payload
   */
  async execute(inputs = {}, state) {
    if (state && typeof state.setVariable === "function") {
      Object.entries(inputs).forEach(([k, v]) => {
        state.setVariable(k, v);
      });
    }

    return {
      status: "STARTED",
      timestamp: new Date().toISOString(),
      triggerData: inputs,
    };
  }
}

export default StartNode;
