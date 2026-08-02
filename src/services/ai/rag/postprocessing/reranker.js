/**
 * @file reranker.js
 * @description Cross-encoder reranking interface.
 */

export const reranker = {
  /**
   * Reranks retrieval items against original query.
   * @param {string} query
   * @param {Object[]} items
   * @returns {Promise<Object[]>}
   */
  rerank: async (query, items = []) => {
    return items;
  },
};

export default reranker;
