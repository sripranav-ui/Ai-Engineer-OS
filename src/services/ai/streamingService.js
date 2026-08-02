import logger from "../../utils/logger";

/**
 * Text Token Streaming Service
 */
export const streamingService = {
  /**
   * Dispatches text segments callbacks sequentially
   */
  streamText: (text, onChunk, onComplete) => {
    logger.info("[StreamingService] Commencing text streaming stream...");
    
    // Split input content by space tokens
    const words = text.split(" ");
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        const chunk = words[index] + " ";
        if (onChunk) onChunk(chunk);
        index++;
      } else {
        clearInterval(interval);
        logger.info("[StreamingService] Streaming stream finished.");
        if (onComplete) onComplete();
      }
    }, 80); // Simulate typist frequency delay
  }
};

export default streamingService;
