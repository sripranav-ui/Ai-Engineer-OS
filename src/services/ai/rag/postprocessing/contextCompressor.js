/**
 * @file contextCompressor.js
 * @description Passage deduplicator and token context compressor.
 */

export const contextCompressor = {
  /**
   * Deduplicates and compresses retrieval chunks.
   * @param {Object[]} items
   * @param {number} [maxChunks=8]
   * @returns {Object[]}
   */
  compress: (items = [], maxChunks = 8) => {
    const seenIds = new Set();
    const unique = [];

    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        unique.push(item);
      }
      if (unique.length >= maxChunks) break;
    }

    return unique;
  },
};

export default contextCompressor;
