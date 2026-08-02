// =======================================================
// embeddingService.js — Local High-Performance Vector Embeddings
// =======================================================
// Generates 64-dimensional normalized vector embeddings 100% locally
// in pure JavaScript without external API calls or network latency.
// =======================================================

export class EmbeddingService {
  constructor(dimensions = 64) {
    this.dimensions = dimensions;
  }

  /**
   * Generate 64-dimensional L2-normalized vector embedding for input text
   * @param {string} text
   * @param {number} [dimensions]
   * @returns {Array<number>} Vector embedding array
   */
  generateEmbedding(text = "", dimensions = this.dimensions) {
    const dims = dimensions || this.dimensions;
    const vector = new Array(dims).fill(0);
    if (!text || typeof text !== "string") return vector;

    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const words = normalized.split(/\s+/).filter((w) => w.length > 1);

    if (words.length === 0) return vector;

    // Hash word n-grams into vector dimensions
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash1 = this.stringHash(word);
      const index1 = Math.abs(hash1) % dims;
      vector[index1] += 1.0;

      if (i < words.length - 1) {
        const bigram = `${word}_${words[i + 1]}`;
        const hash2 = this.stringHash(bigram);
        const index2 = Math.abs(hash2) % dims;
        vector[index2] += 1.5;
      }
    }

    // L2 Normalization (unit length vector)
    let normSq = 0;
    for (let i = 0; i < dims; i++) {
      normSq += vector[i] * vector[i];
    }

    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let i = 0; i < dims; i++) {
        vector[i] = vector[i] / norm;
      }
    }

    return vector;
  }

  /** FNV-1a Hash function */
  stringHash(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash;
  }

  /** Compute deterministic 64-bit style dual-hash content string for caching */
  computeContentHash(text = "") {
    if (!text || typeof text !== "string") return "empty_0";
    let hash1 = 0x811c9dc5;
    let hash2 = 0x5bd1e995;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash1 = Math.imul(hash1 ^ char, 16777619);
      hash2 = Math.imul(hash2 ^ char, 0x5bd1e995);
    }
    return `fnv_${(hash1 >>> 0).toString(16)}_${(hash2 >>> 0).toString(16)}_${text.length}`;
  }
}

export const embeddingService = new EmbeddingService(64);
export default embeddingService;
