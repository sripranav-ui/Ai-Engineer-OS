/**
 * @file toolNode.js
 * @description Workflow node that executes a permissioned tool via toolExecutor.
 */

import BaseWorkflowNode from "../base/baseNode.js";
import toolExecutor from "../../tools/runtime/toolExecutor.js";

export class ToolNode extends BaseWorkflowNode {
  /**
   * Constructs a ToolNode instance.
   * @param {Object} options
   * @param {string} options.id - Node instance ID
   * @param {string} [options.label='Tool Step']
   * @param {Object} options.config
   * @param {string} options.config.toolId - Target tool ID
   */
  constructor({ id, label = "Tool Step", config = {} }) {
    super({ id, type: "tool", label, config });
  }

  validateInputs(inputs = {}) {
    const toolId = inputs.toolId || this.config.toolId;
    if (!toolId) {
      return { valid: false, errors: ["ToolNode requires a 'toolId' in inputs or config."] };
    }
    return { valid: true, errors: [] };
  }

  async execute(inputs = {}, state) {
    const validation = this.validateInputs(inputs);
    if (!validation.valid) {
      throw new Error(`Validation Error in ToolNode "${this.id}": ${validation.errors.join(", ")}`);
    }

    const toolId = inputs.toolId || this.config.toolId;
    const args = inputs.args || this.config.args || {};

    const toolResult = await toolExecutor.executeTool(toolId, args);

    return {
      toolId,
      toolResult,
      executedAt: new Date().toISOString(),
    };
  }
}

export default ToolNode;
