/**
 * @file baseNode.js
 * @description Abstract base class for all workflow graph nodes in AI Engineer OS.
 * Serves as the foundational contract requiring id, type, label, input validation,
 * and async execution.
 */

export class BaseWorkflowNode {
  /**
   * Constructs a new BaseWorkflowNode instance.
   * @param {Object} options
   * @param {string} options.id - Unique node instance ID
   * @param {string} options.type - Node category type (e.g., 'start', 'agent', 'tool')
   * @param {string} [options.label] - Human-readable node display title
   * @param {Object} [options.config={}] - Node configuration parameters
   */
  constructor({ id, type, label, config = {} }) {
    if (!id || !type) {
      throw new Error("BaseWorkflowNode construction requires both 'id' and 'type'.");
    }
    this.id = id;
    this.type = type;
    this.label = label || type.toUpperCase();
    this.config = config;
    this.enabled = true;
  }

  /**
   * Validates incoming inputs prior to execution.
   * @param {Object} inputs - Key-value payload of inputs for this node
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateInputs(inputs = {}) {
    return { valid: true, errors: [] };
  }

  /**
   * Primary execution method for the workflow node.
   * Must be overridden by every concrete subclass node.
   * @param {Object} inputs - Validated inputs for this node
   * @param {Object} state - Active WorkflowState instance
   * @returns {Promise<Object>} Step execution output payload
   */
  async execute(inputs, state) {
    throw new Error(`execute() method not implemented for workflow node "${this.id}" of type "${this.type}".`);
  }
}

export default BaseWorkflowNode;
