/**
 * @file retrievalService.js
 * @description Knowledge Intelligence Layer — Semantic & Hybrid Search Engine.
 * Supports Vector Cosine Similarity Search, Keyword-Vector Hybrid Fusion Search,
 * Top-K Retrieval, Score Normalization, and Related Document Recommendation.
 */

import embeddingFactory from "./embeddings/embeddingFactory.js";
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
   * Compute Keyword Match Score (BM25 / Term Frequency ratio)
   * @param {string} query
   * @param {string} text
   * @returns {number} Keyword score (0.0 to 1.0)
   */
  keywordScore(query = "", text = "") {
    if (!query || !text) return 0;
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    if (queryTerms.length === 0) return 0;

    const lowerText = text.toLowerCase();
    let matches = 0;
    queryTerms.forEach((term) => {
      if (lowerText.includes(term)) matches++;
    });

    return matches / queryTerms.length;
  }

  /**
   * Semantic Vector Search
   */
  async searchSemantic(query = "", options = {}) {
    return this.search(query, { ...options, mode: "semantic" });
  }

  /**
   * Hybrid Search (Vector Similarity + Keyword Term Matching)
   */
  async searchHybrid(query = "", options = {}) {
    return this.search(query, { ...options, mode: "hybrid" });
  }

  /**
   * Master Search Pipeline (Semantic or Hybrid Mode)
   * @param {string} query - Query string
   * @param {Object} [options={}] - Options ({ topK: 5, similarityThreshold: 0.15, mode: "hybrid" })
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

    const topK = options.topK || 5;
    const threshold = options.similarityThreshold ?? 0.15;
    const filterDocId = options.filterDocId || null;
    const mode = options.mode || "hybrid";

    const queryVector = embeddingFactory.generateEmbedding(query);
    const allChunks = await vectorStorageAdapter.getChunks();

    let candidateChunks = allChunks;
    if (filterDocId) {
      candidateChunks = allChunks.filter((c) => c.docId === filterDocId || c.documentId === filterDocId);
    }

    const scoredChunks = candidateChunks.map((chunk) => {
      const vecScore = chunk.embedding ? this.cosineSimilarity(queryVector, chunk.embedding) : 0;
      const kwScore = this.keywordScore(query, chunk.text);

      let finalScore = vecScore;
      if (mode === "hybrid") {
        // Hybrid Score: 70% Semantic Vector + 30% Keyword Match
        finalScore = 0.7 * vecScore + 0.3 * kwScore;
      }

      return {
        ...chunk,
        vectorScore: vecScore,
        keywordScore: kwScore,
        similarityScore: finalScore,
        scorePercentage: `${Math.round(finalScore * 100)}%`,
      };
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore);

    // Filter by threshold & pick Top K
    const relevantChunks = scoredChunks
      .filter((c) => c.similarityScore >= threshold)
      .slice(0, topK);

    let formattedContext = "";
    if (relevantChunks.length > 0) {
      formattedContext = relevantChunks
        .map(
          (c, idx) =>
            `[Knowledge Chunk ${idx + 1} — Document: "${c.docTitle}" (Page ${c.pageNumber || 1}, Match: ${c.scorePercentage})]:\n${c.text}`
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
        id: c.id || c.chunkId,
        docId: c.docId || c.documentId,
        docTitle: c.docTitle,
        pageNumber: c.pageNumber || 1,
        similarityScore: c.similarityScore,
        scorePercentage: c.scorePercentage,
        chunkPreview: c.text.substring(0, 140) + (c.text.length > 140 ? "..." : ""),
      })),
    };

    ragLogger.info(
      `Search ("${query}", mode: ${mode}) matched ${relevantChunks.length}/${candidateChunks.length} chunk(s) in ${retrievalTimeMs}ms.`
    );

    return {
      chunks: relevantChunks,
      formattedContext,
      diagnostics,
    };
  }

  /**
   * Related Documents Engine
   * Computes cosine similarity between target document chunks and all other documents in storage
   * @param {string} docId - Target document ID
   * @param {Object} [options={}] - Options ({ topN: 3 })
   * @returns {Promise<Array<Object>>} Array of related document objects with similarity scores
   */
  async getRelatedDocuments(docId, options = {}) {
    if (!docId) return [];
    const topN = options.topN || 3;

    const targetChunks = await vectorStorageAdapter.getChunksByDocId(docId);
    if (!targetChunks || targetChunks.length === 0) return [];

    const targetDocText = targetChunks.map((c) => c.text).join(" ").substring(0, 1000);
    const targetVector = embeddingFactory.generateEmbedding(targetDocText);

    const allDocs = await vectorStorageAdapter.getDocuments();
    const otherDocs = allDocs.filter((d) => d.id !== docId);

    const scoredDocs = [];
    for (const doc of otherDocs) {
      const docChunks = await vectorStorageAdapter.getChunksByDocId(doc.id);
      if (!docChunks || docChunks.length === 0) continue;

      const docText = docChunks.map((c) => c.text).join(" ").substring(0, 1000);
      const docVector = embeddingFactory.generateEmbedding(docText);
      const similarity = this.cosineSimilarity(targetVector, docVector);

      scoredDocs.push({
        ...doc,
        similarityScore: similarity,
        scorePercentage: `${Math.round(similarity * 100)}%`,
      });
    }

    scoredDocs.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredDocs.slice(0, topN);
  }
}

export const retrievalService = new RetrievalService();
export default retrievalService;
