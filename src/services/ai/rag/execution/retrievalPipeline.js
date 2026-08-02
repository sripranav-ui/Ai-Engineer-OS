/**
 * @file retrievalPipeline.js
 * @description RAG Pipeline executing Plan -> Parallel Search -> Rank -> Compress -> Format Citations.
 */

import retrievalPlanner from "./retrievalPlanner.js";
import retrievalRouter from "./retrievalRouter.js";
import retrievalCache from "./retrievalCache.js";
import rankingEngine from "../postprocessing/rankingEngine.js";
import reranker from "../postprocessing/reranker.js";
import contextCompressor from "../postprocessing/contextCompressor.js";
import sourceCitationService from "../postprocessing/sourceCitationService.js";
import logger from "../../../../utils/logger.js";

export const retrievalPipeline = {
  /**
   * Executes RAG Retrieval Pipeline end-to-end.
   * @param {string} query
   * @param {Object} [options={}]
   * @returns {Promise<Object>} Package containing formattedContext and citations
   */
  execute: async (query, options = {}) => {
    const cached = retrievalCache.get(query);
    if (cached) {
      logger.info(`[RetrievalPipeline] Cache hit for query "${query}".`);
      return cached;
    }

    // 1. Plan
    const plan = retrievalPlanner.createPlan(query);

    // 2. Parallel Search
    const rawResults = await retrievalRouter.dispatchParallel(plan.targetProviders, query, options);

    // 3. Rank & Rerank
    const ranked = rankingEngine.rankResults(rawResults);
    const reranked = await reranker.rerank(query, ranked);

    // 4. Compress & Deduplicate
    const compressed = contextCompressor.compress(reranked, plan.maxChunks);

    // 5. Format Citations
    const formattedContext = sourceCitationService.formatCitations(compressed);

    const resultPackage = {
      query,
      chunks: compressed,
      formattedContext,
      totalRetrieved: rawResults.length,
      executedAt: new Date().toISOString(),
    };

    retrievalCache.set(query, resultPackage);
    return resultPackage;
  },
};

export default retrievalPipeline;
