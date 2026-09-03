/**
 * @file contextBuilder.js
 * @description Context Builder Service for Phase 4.4 True RAG Integration.
 * Retrieves Top K chunks from retrievalService, deduplicates, limits window size,
 * attaches source attribution metadata, and formats clean prompt contexts.
 */

import retrievalService from "./retrievalService.js";
import ragLogger from "./ragLogger.js";

export class ContextBuilderService {
  /**
   * Builds RAG prompt context and source attribution array for an input user query
   * @param {string} query - User prompt string
   * @param {Object} [options={}] - Options ({ topK: 6, similarityThreshold: 0.15 })
   * @returns {Promise<{ hasKnowledge: boolean, sources: Array<Object>, formattedContext: string, systemPrompt: string, diagnostics: Object }>}
   */
  async buildRAGContext(query = "", options = {}) {
    const topK = options.topK || 6;
    const threshold = options.similarityThreshold ?? 0.15;

    if (!query || !query.trim()) {
      return {
        hasKnowledge: false,
        sources: [],
        formattedContext: "",
        systemPrompt: this.getSystemPrompt(),
        diagnostics: {},
      };
    }

    try {
      const searchResult = await retrievalService.search(query, {
        topK,
        similarityThreshold: threshold,
        mode: "hybrid",
      });

      const rawChunks = searchResult.chunks || [];
      if (rawChunks.length === 0) {
        return {
          hasKnowledge: false,
          sources: [],
          formattedContext: "",
          systemPrompt: this.getSystemPrompt(),
          diagnostics: searchResult.diagnostics || {},
        };
      }

      // Deduplicate chunks by contentHash or chunkId
      const uniqueChunks = [];
      const seenHashes = new Set();

      for (const chunk of rawChunks) {
        const hashKey = chunk.contentHash || chunk.id || chunk.text;
        if (!seenHashes.has(hashKey)) {
          seenHashes.add(hashKey);
          uniqueChunks.push(chunk);
        }
      }

      // Limit max total context length (max 4000 chars)
      let currentLength = 0;
      const finalChunks = [];
      for (const c of uniqueChunks) {
        if (currentLength + c.text.length > 4000 && finalChunks.length > 0) break;
        finalChunks.push(c);
        currentLength += c.text.length;
      }

      // Build Source Attribution Array
      const sources = finalChunks.map((c) => ({
        id: c.id || c.chunkId,
        docId: c.docId || c.documentId,
        docTitle: c.docTitle || "Untitled Document",
        pageNumber: c.pageNumber || 1,
        similarityScore: c.similarityScore,
        scorePercentage: c.scorePercentage || `${Math.round((c.similarityScore || 0) * 100)}%`,
        text: c.text,
      }));

      // Format Prompt Context
      const formattedContext = finalChunks
        .map(
          (c, idx) =>
            `[KNOWLEDGE SOURCE ${idx + 1} — "${c.docTitle}" (Page ${c.pageNumber || 1}, Match: ${c.scorePercentage})]:\n${c.text}`
        )
        .join("\n\n");

      ragLogger.info(`Built RAG context with ${sources.length} sources for query: "${query}"`);

      return {
        hasKnowledge: sources.length > 0,
        sources,
        formattedContext,
        systemPrompt: this.getSystemPrompt(),
        diagnostics: searchResult.diagnostics || {},
      };
    } catch (err) {
      ragLogger.error("Failed to build RAG context:", err);
      return {
        hasKnowledge: false,
        sources: [],
        formattedContext: "",
        systemPrompt: this.getSystemPrompt(),
        diagnostics: {},
      };
    }
  }

  getSystemPrompt() {
    return (
      "You are AI Engineer OS, an elite AI assistant.\n" +
      "Answer ONLY using the supplied knowledge context whenever possible.\n" +
      "If the knowledge context is insufficient to answer the question, clearly state that knowledge is missing before providing general assistance.\n" +
      "Never hallucinate citations or invent non-existent documents."
    );
  }
}

export const contextBuilderService = new ContextBuilderService();
export default contextBuilderService;
