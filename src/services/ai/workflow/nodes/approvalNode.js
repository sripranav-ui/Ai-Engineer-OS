/**
 * @file approvalNode.js
 * @description Workflow node that pauses execution until explicit human approval or rejection.
 */

import BaseWorkflowNode from "../base/baseNode.js";
import logger from "../../../../utils/logger.js";

export class ApprovalNode extends BaseWorkflowNode {
  /**
   * Constructs an ApprovalNode instance.
   * @param {Object} options
   * @param {string} options.id - Node instance ID
   * @param {string} [options.label='Human Approval Required']
   * @param {Object} [options.config={}]
   * @param {string} [options.config.prompt='Approve execution step?']
   */
  constructor({ id, label = "Human Approval Required", config = {} }) {
    super({ id, type: "approval", label, config });
  }

  async execute(inputs = {}, state) {
    if (state) {
      state.status = "PAUSED_APPROVAL";
      state.createCheckpoint();
    }

    logger.info(`[ApprovalNode] Workflow execution paused at node "${this.id}" for human approval.`);

    return {
      status: "PAUSED_APPROVAL",
      nodeId: this.id,
      prompt: this.config.prompt || "Approve execution step?",
      pausedAt: new Date().toISOString(),
    };
  }
}

export default ApprovalNode;
