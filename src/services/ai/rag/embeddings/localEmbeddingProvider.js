/**
 * @file localEmbeddingProvider.js
 * @description Local High-Performance 64-Dimensional L2-Normalized Embedding Engine.
 * Generates normalized vector embeddings 100% locally in pure JavaScript.
 * Includes fast deterministic string hashing (FNV-1a) for document content hash verification.
 *
 * Public API:
 * - generateEmbedding(text: string): Array<number>
 * - stringHash(text: string): string
 */

import { EmbeddingProvider } from "./embeddingProvider.js";

export class LocalEmbeddingProvider extends EmbeddingProvider {
  constructor(dimensions = 64) {
    super("local-js-64dim", dimensions);
  }

  /**
   * Generates a 64-dimensional L2-normalized vector embedding for given text
   * @param {string} text
   * @returns {Array<number>}
   */
  generateEmbedding(text = "") {
    const vector = new Array(this.dimensions).fill(0);
    if (!text || typeof text !== "string") return vector;

    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const words = normalized.split(/\s+/).filter((w) => w.length > 1);

    if (words.length === 0) return vector;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash1 = this.hash32(word);
      const index1 = Math.abs(hash1) % this.dimensions;
      vector[index1] += 1.0;

      if (i < words.length - 1) {
        const bigram = `${word}_${words[i + 1]}`;
        const hash2 = this.hash32(bigram);
        const index2 = Math.abs(hash2) % this.dimensions;
        vector[index2] += 1.5;
      }
    }

    // L2 Normalization
    let normSq = 0;
    for (let i = 0; i < this.dimensions; i++) {
      normSq += vector[i] * vector[i];
    }

    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] = vector[i] / norm;
      }
    }

    return vector;
  }

  /** FNV-1a 32-bit hash algorithm */
  hash32(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash;
  }

  /** Deterministic String Content Hash for document & chunk caching */
  computeContentHash(text = "") {
    if (!text) return "empty_0";
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

export const localEmbeddingProvider = new LocalEmbeddingProvider(64);
export default localEmbeddingProvider;
