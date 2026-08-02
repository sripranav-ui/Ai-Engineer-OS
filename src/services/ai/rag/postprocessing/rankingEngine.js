/**
 * @file rankingEngine.js
 * @description Multi-attribute ranking engine evaluating similarity, recency, and provider weights.
 */

export const rankingEngine = {
  /**
   * Ranks merged retrieval items by calculated score.
   * @param {Object[]} items
   * @returns {Object[]} Sorted items
   */
  rankResults: (items = []) => {
    const scored = items.map((item) => {
      let finalScore = item.score || 50;

      // Provider confidence weight
      if (item.provider === "graph_search") finalScore += 15;
      if (item.provider === "memory_search") finalScore += 10;

      return { ...item, finalScore };
    });

    scored.sort((a, b) => b.finalScore - a.finalScore);
    return scored;
  },
};

export default rankingEngine;
