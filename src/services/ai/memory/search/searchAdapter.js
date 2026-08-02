// =======================================================
// searchAdapter.js — Vector & Semantic Search Abstraction
// =======================================================
// Extensible search interface. Plugs into local fuzzy search
// today, with prepared interfaces for OpenAI/Gemini embeddings,
// Pinecone, Qdrant, or Supabase pgvector in future phases.
// =======================================================

import logger from "../../../../utils/logger";

export const VECTOR_PROVIDERS = {
  LOCAL_FUZZY: "localFuzzy",
  OPENAI_EMBEDDINGS: "openaiEmbeddings",
  PINECONE: "pinecone",
  QDRANT: "qdrant",
};

export class SearchAdapter {
  constructor(provider = VECTOR_PROVIDERS.LOCAL_FUZZY) {
    this.provider = provider;
  }

  /**
   * Search over a memory items collection using string matching / embeddings
   * @param {string} queryText - query string
   * @param {Array<object>} items - list of documents or memories
   * @param {number} topK - max results
   */
  async search(queryText, items = [], topK = 5) {
    if (!queryText.trim() || items.length === 0) return [];

    logger.info(`[SearchAdapter] Searching query "${queryText}" via ${this.provider}...`);
    const q = queryText.toLowerCase();

    // Local Fuzzy Token Search Fallback Strategy
    const scored = items.map((item) => {
      let score = 0;
      const text = (item.title || item.content || item.question || item.text || "").toLowerCase();

      if (text.includes(q)) score += 10;

      // Word matching
      const words = q.split(" ");
      words.forEach((w) => {
        if (w.length > 2 && text.includes(w)) score += 2;
      });

      return { item, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.item);
  }

  /**
   * Prepared placeholder method for vector embedding generation
   */
  async generateEmbedding(text) {
    logger.info(`[SearchAdapter] Generating embedding stub for text length ${text.length}`);
    return new Array(1536).fill(0.01);
  }
}

export const defaultSearchAdapter = new SearchAdapter();
export default defaultSearchAdapter;
