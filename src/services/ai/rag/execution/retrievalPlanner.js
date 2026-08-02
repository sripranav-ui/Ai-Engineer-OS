/**
 * @file retrievalPlanner.js
 * @description Analyzes query intent and generates a retrieval execution plan.
 */

import logger from "../../../../utils/logger.js";

export const retrievalPlanner = {
  /**
   * Generates retrieval execution plan based on query intent.
   * @param {string} query
   * @returns {Object} Plan shape ({ targetProviders, maxChunks })
   */
  createPlan: (query) => {
    logger.info(`[RetrievalPlanner] Analyzing query intent for: "${query}"...`);
    return {
      query,
      targetProviders: ["graph_search", "memory_search", "keyword_search", "mcp_knowledge"],
      maxChunks: 8,
      createdAt: new Date().toISOString(),
    };
  },
};

export default retrievalPlanner;
