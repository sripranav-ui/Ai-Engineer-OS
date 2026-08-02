// =======================================================
// streamingEngine.js — Token & Chunk Streaming Engine
// =======================================================
// Dispatches streaming responses chunk-by-chunk to the UI.
// Supports cancellation via AbortController.
// =======================================================

import logger from "../../utils/logger";

export const streamingEngine = {
  /**
   * Streams text sequentially token by token or word by word
   * @param {string} fullText - text content to stream
   * @param {function} onChunk - (chunkText: string) => void
   * @param {function} onComplete - () => void
   * @param {number} delayMs - delay per chunk in ms (default 40ms)
   * @returns {AbortController} controller to cancel stream if needed
   */
  streamText: (fullText, onChunk, onComplete, delayMs = 40) => {
    logger.info("[StreamingEngine] Initializing stream...");
    const controller = new AbortController();
    const { signal } = controller;

    const words = fullText.split(" ");
    let index = 0;

    const interval = setInterval(() => {
      if (signal.aborted) {
        clearInterval(interval);
        logger.info("[StreamingEngine] Stream aborted by caller.");
        return;
      }

      if (index < words.length) {
        const chunk = words[index] + (index < words.length - 1 ? " " : "");
        if (onChunk) onChunk(chunk);
        index++;
      } else {
        clearInterval(interval);
        logger.info("[StreamingEngine] Stream completed.");
        if (onComplete) onComplete();
      }
    }, delayMs);

    return controller;
  },
};

export default streamingEngine;
