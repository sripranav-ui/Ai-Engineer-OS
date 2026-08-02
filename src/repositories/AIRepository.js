import logger from "../utils/logger";
import storageService from "../services/storageService";

/**
 * AIRepository implementation (Abstracting dialogue sessions database with namespacing)
 */
export const AIRepository = {
  /**
   * Retrieves conversation transcript sessions lists scoped by active workspace
   */
  getConversations: async (workspaceId = "default") => {
    logger.info(`[AIRepository] Reading dialogue archives for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_ai_dialogues`);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Saves dialogue transcripts scoped by active workspace
   */
  saveConversations: async (conversations, workspaceId = "default") => {
    logger.info(`[AIRepository] Updating dialogue logs for workspace "${workspaceId}"...`);
    storageService.set(`${workspaceId}_ai_dialogues`, JSON.stringify(conversations));
    return conversations;
  }
};

export default AIRepository;
