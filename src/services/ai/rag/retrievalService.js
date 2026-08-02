/**
 * @file retrievalService.js
 * @description Local Semantic Retrieval & Search Diagnostics Engine.
 * Computes Cosine Similarity between query vector and candidate chunk vectors stored in IndexedDB.
 * Ranks chunks, applies similarity thresholding & Top-K cutoffs, formats RAG context,
 * and generates detailed performance and diagnostic telemetry.
 *
 * Public API:
 * - search(query: string, options?: Object): Promise<{ chunks: Array<Object>, formattedContext: string, diagnostics: Object }>
 * - cosineSimilarity(vecA: Array<number>, vecB: Array<number>): number
 */

import localEmbeddingProvider from "./embeddings/localEmbeddingProvider.js";
import vectorStorageAdapter from "./storage/vectorStorageAdapter.js";
import ragLogger from "./ragLogger.js";

export class RetrievalService {
  /**
   * Calculate Cosine Similarity between two normalized vectors
   * @param {Array<number>} vecA
   * @param {Array<number>} vecB
   * @returns {number} Cosine similarity score (0.0 to 1.0)
   */
  cosineSimilarity(vecA = [], vecB = []) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);
    let dotProduct = 0;
    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, dotProduct));
  }

  /**
   * Search local vector storage for relevant chunks matching user query
   * @param {string} query - Query string
   * @param {Object} [options={}] - Options ({ topK: 4, similarityThreshold: 0.15, filterDocId: null })
   * @returns {Promise<{ chunks: Array<Object>, formattedContext: string, diagnostics: Object }>}
   */
  async search(query = "", options = {}) {
    const startTime = performance.now();

    if (!query || !query.trim()) {
      return {
        chunks: [],
        formattedContext: "",
        diagnostics: {
          retrievalTimeMs: 0,
          scoredCount: 0,
          matchedCount: 0,
          promptContextLength: 0,
          chunks: [],
        },
      };
    }

    const topK = options.topK || 4;
    const threshold = options.similarityThreshold ?? 0.15;
    const filterDocId = options.filterDocId || null;

    const queryVector = localEmbeddingProvider.generateEmbedding(query);
    const allChunks = await vectorStorageAdapter.getChunks();

    let candidateChunks = allChunks;
    if (filterDocId) {
      candidateChunks = allChunks.filter((c) => c.docId === filterDocId);
    }

    const scoredChunks = candidateChunks.map((chunk) => {
      const score = chunk.embedding ? this.cosineSimilarity(queryVector, chunk.embedding) : 0;
      return { ...chunk, similarityScore: score };
    });

    // Sort descending by similarity score
    scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore);

    // Filter by similarity threshold & pick Top K
    const relevantChunks = scoredChunks
      .filter((c) => c.similarityScore >= threshold)
      .slice(0, topK);

    let formattedContext = "";
    if (relevantChunks.length > 0) {
      formattedContext = relevantChunks
        .map(
          (c, idx) =>
            `[Knowledge Chunk ${idx + 1} — Document: "${c.docTitle}" (Page ${c.pageNumber || 1}, Score: ${(c.similarityScore * 100).toFixed(1)}%)]:\n${c.text}`
        )
        .join("\n\n");
    }

    const retrievalTimeMs = Math.round(performance.now() - startTime);

    const diagnostics = {
      retrievalTimeMs,
      scoredCount: candidateChunks.length,
      matchedCount: relevantChunks.length,
      promptContextLength: formattedContext.length,
      chunks: relevantChunks.map((c) => ({
        id: c.id,
        docId: c.docId,
        docTitle: c.docTitle,
        pageNumber: c.pageNumber || 1,
        similarityScore: c.similarityScore,
        scorePercentage: `${(c.similarityScore * 100).toFixed(1)}%`,
        chunkPreview: c.text.substring(0, 120) + (c.text.length > 120 ? "..." : ""),
      })),
    };

    ragLogger.info(
      `Query "${query}" matched ${relevantChunks.length}/${candidateChunks.length} chunk(s) in ${retrievalTimeMs}ms.`
    );

    return {
      chunks: relevantChunks,
      formattedContext,
      diagnostics,
    };
  }
}

export const retrievalService = new RetrievalService();
export default retrievalService;
