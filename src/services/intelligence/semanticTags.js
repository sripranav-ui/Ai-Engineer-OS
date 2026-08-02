/**
 * @file semanticTags.js
 * @description Automated semantic tag extractor for Knowledge Graph entities.
 */

export const semanticTags = {
  /**
   * Generates semantic tags for text content.
   * @param {string} text
   * @returns {string[]}
   */
  generateTags: (text = "") => {
    const keywords = ["ai", "rag", "agent", "workflow", "project", "code", "react", "python", "node"];
    const lower = String(text || "").toLowerCase();
    return keywords.filter((k) => lower.includes(k));
  },
};

export default semanticTags;
