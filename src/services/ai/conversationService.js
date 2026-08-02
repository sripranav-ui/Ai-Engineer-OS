import logger from "../../utils/logger";

// Local in-memory session message chains maps
const historyRegistry = {};

/**
 * Chat History and Context Length Service
 */
export const conversationService = {
  /**
   * Appends messages to conversation history index list
   */
  append: (conversationId, role, content) => {
    if (!historyRegistry[conversationId]) {
      historyRegistry[conversationId] = [];
    }
    historyRegistry[conversationId].push({
      role,
      content,
      timestamp: Date.now()
    });
    
    logger.info(`[ConversationHistory] Appended "${role}" message to session "${conversationId}"`);
  },

  /**
   * Retrieves chronological lists for session
   */
  getHistory: (conversationId) => {
    return historyRegistry[conversationId] || [];
  },

  /**
   * Deletes message arrays references
   */
  clear: (conversationId) => {
    historyRegistry[conversationId] = [];
    logger.info(`[ConversationHistory] Cleared session "${conversationId}" history.`);
  }
};

export default conversationService;
