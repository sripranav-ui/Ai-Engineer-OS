/**
 * @file ragEngine.js
 * @description Master RAG Engine facade exposing retrieveContext API.
 */

import ragManager from "./ragManager.js";

export const ragEngine = {
  /**
   * Primary entry point for Hybrid Context Retrieval.
   * @param {string} query - User search prompt
   * @param {Object} [options={}]
   * @returns {Object} Retrieval package ({ formattedContext, chunks })
   */
  retrieveContext: (query, options = {}) => {
    return ragManager.retrieveContext(query, options);
  },
};

export default ragEngine;
