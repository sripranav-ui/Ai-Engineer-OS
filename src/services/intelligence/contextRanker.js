/**
 * @file contextRanker.js
 * @description Context ranking & scoring engine ranking Knowledge Graph nodes.
 */

import workspaceKnowledgeGraph from "./workspaceKnowledgeGraph.js";
import relevanceScorer from "./relevanceScorer.js";

export const contextRanker = {
  /**
   * Ranks Knowledge Graph nodes by relevance to query.
   * @param {string} query
   * @param {number} [limit=10]
   * @returns {Object[]} Top ranked nodes
   */
  rankNodes: (query, limit = 10) => {
    const nodes = Array.from(workspaceKnowledgeGraph.nodes.values());
    const scored = nodes.map((n) => ({
      node: n,
      score: relevanceScorer.scoreNode(n, query),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.node);
  },
};

export default contextRanker;
