/**
 * @file relevanceScorer.js
 * @description Relevance scoring calculator evaluating node match scores against query terms.
 */

export const relevanceScorer = {
  /**
   * Calculates numerical relevance score (0 - 100) for a node against query text.
   * @param {Object} node
   * @param {string} query
   * @returns {number}
   */
  scoreNode: (node, query = "") => {
    if (!node || !query) return 0;
    const q = query.toLowerCase();
    const title = (node.title || "").toLowerCase();
    const type = (node.type || "").toLowerCase();

    let score = 0;
    if (title === q) score += 100;
    else if (title.includes(q)) score += 60;
    if (type.includes(q)) score += 30;

    return Math.min(100, score);
  },
};

export default relevanceScorer;
