/**
 * @file agentCommunicationBus.js
 * @description Internal message broker for inter-agent communication and context sharing.
 */

import eventBus from "../../plugins/eventBus.js";
import logger from "../../../utils/logger.js";

const MESSAGE_HISTORY = [];

export const agentCommunicationBus = {
  /**
   * Publishes structured message between agents.
   * @param {string} senderAgentId
   * @param {string} receiverAgentId
   * @param {string} messageType - "task_assignment" | "status_update" | "result_passing" | "approval_request"
   * @param {Object} payload
   */
  sendMessage: (senderAgentId, receiverAgentId, messageType, payload = {}) => {
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sender: senderAgentId,
      receiver: receiverAgentId,
      type: messageType,
      payload,
      timestamp: new Date().toISOString(),
    };

    MESSAGE_HISTORY.unshift(msg);
    if (MESSAGE_HISTORY.length > 200) MESSAGE_HISTORY.pop();

    eventBus.publish(`agent_msg.${messageType}`, msg);
    logger.info(`[AgentCommunicationBus] [${messageType}] "${senderAgentId}" -> "${receiverAgentId}"`);
    return msg;
  },

  getHistory: () => [...MESSAGE_HISTORY],
};

export default agentCommunicationBus;
