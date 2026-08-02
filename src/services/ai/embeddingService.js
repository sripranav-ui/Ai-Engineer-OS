import logger from "../../utils/logger";

/**
 * Semantic Vector Embeddings Generator Service
 */
export const embeddingService = {
  /**
   * Generates mock 1536-dimension float vectors array for input texts
   */
  create: async (text) => {
    logger.info(`[EmbeddingService] Generating float array coordinates for text segment: "${text.substring(0, 30)}..."`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock array containing 1536 float nodes coordinates
        const mockVector = Array.from({ length: 1536 }).map(() => Math.random() * 2 - 1);
        resolve(mockVector);
      }, 100);
    });
  }
};

export default embeddingService;
