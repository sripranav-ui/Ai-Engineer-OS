/**
 * @file agentNode.js
 * @description Workflow node that delegates task execution steps to a specialized AI Agent
 * via agentOrchestrator.
 */

import BaseWorkflowNode from "../base/baseNode.js";
import agentOrchestrator from "../../agents/orchestrator/agentOrchestrator.js";

export class AgentNode extends BaseWorkflowNode {
  /**
   * Constructs an AgentNode instance.
   * @param {Object} options
   * @param {string} options.id - Node instance ID
   * @param {string} [options.label='AI Agent Step']
   * @param {Object} options.config
   * @param {string} options.config.goal - Goal string for the agent
   * @param {string} [options.config.agentRole='coder'] - Target agent role
   */
  constructor({ id, label = "AI Agent Step", config = {} }) {
    super({ id, type: "agent", label, config });
  }

  validateInputs(inputs = {}) {
    const goal = inputs.goal || this.config.goal;
    if (!goal) {
      return { valid: false, errors: ["AgentNode requires a 'goal' in inputs or config."] };
    }
    return { valid: true, errors: [] };
  }

  async execute(inputs = {}, state) {
    const validation = this.validateInputs(inputs);
    if (!validation.valid) {
      throw new Error(`Validation Error in AgentNode "${this.id}": ${validation.errors.join(", ")}`);
    }

    const goal = inputs.goal || this.config.goal;
    const result = await agentOrchestrator.dispatchGoal(goal);

    return {
      agentResult: result,
      completedAt: new Date().toISOString(),
    };
  }
}

export default AgentNode;
