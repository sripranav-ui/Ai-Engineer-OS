/**
 * @file sourceCitationService.js
 * @description Metadata citation tracker attaching source metadata to context packages.
 */

export const sourceCitationService = {
  /**
   * Formats retrieval chunks into structured text with source citations.
   * @param {Object[]} chunks
   * @returns {string} Formatted prompt text with citations
   */
  formatCitations: (chunks = []) => {
    if (!chunks || chunks.length === 0) return "";

    const lines = ["=== RETRIEVED KNOWLEDGE SOURCES ==="];
    chunks.forEach((c, idx) => {
      lines.push(`[Source ${idx + 1}] (${c.provider} | Score: ${c.finalScore || c.score})`);
      lines.push(`Content: ${c.text}`);
      lines.push(`Source ID: ${c.sourceId} | Type: ${c.sourceType || "Document"}`);
      lines.push("---");
    });
    lines.push("=== END KNOWLEDGE SOURCES ===");

    return lines.join("\n");
  },
};

export default sourceCitationService;
