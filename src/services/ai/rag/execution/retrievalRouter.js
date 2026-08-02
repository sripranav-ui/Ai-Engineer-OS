/**
 * @file retrievalRouter.js
 * @description Parallel search dispatcher querying active retrieval providers simultaneously.
 */

import GraphSearchProvider from "../providers/graphSearchProvider.js";
import MemorySearchProvider from "../providers/memorySearchProvider.js";
import KeywordSearchProvider from "../providers/keywordSearchProvider.js";
import SemanticSearchProvider from "../providers/semanticSearchProvider.js";
import PluginKnowledgeProvider from "../providers/pluginKnowledgeProvider.js";
import MCPKnowledgeProvider from "../providers/mcpKnowledgeProvider.js";
import logger from "../../../../utils/logger.js";

const PROVIDERS = new Map([
  ["graph_search", new GraphSearchProvider()],
  ["memory_search", new MemorySearchProvider()],
  ["keyword_search", new KeywordSearchProvider()],
  ["semantic_search", new SemanticSearchProvider()],
  ["plugin_knowledge", new PluginKnowledgeProvider()],
  ["mcp_knowledge", new MCPKnowledgeProvider()],
]);

export const retrievalRouter = {
  /**
   * Dispatches parallel searches across target providers.
   * @param {string[]} targetProviderIds
   * @param {string} query
   * @param {Object} [options={}]
   * @returns {Promise<Object[]>} Aggregated raw search results
   */
  dispatchParallel: async (targetProviderIds, query, options = {}) => {
    logger.info(`[RetrievalRouter] Querying ${targetProviderIds.length} provider(s) in parallel...`);

    const promises = targetProviderIds.map(async (id) => {
      const provider = PROVIDERS.get(id);
      if (!provider) return [];
      try {
        return await provider.search(query, options);
      } catch (err) {
        logger.error(`[RetrievalRouter] Error querying provider "${id}":`, err);
        return [];
      }
    });

    const resultsArray = await Promise.all(promises);
    return resultsArray.flat();
  },
};

export default retrievalRouter;
