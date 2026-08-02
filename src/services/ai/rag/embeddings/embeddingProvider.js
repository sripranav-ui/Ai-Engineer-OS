/**
 * @file embeddingProvider.js
 * @description Abstract Base Class for RAG Embedding Providers.
 * Establishes a uniform interface allowing seamless future pluggability of ONNX,
 * Transformers.js, WebGPU, or API-based embedding models without changing RAG retrieval logic.
 *
 * Public API:
 * - getDimensions(): number
 * - generateEmbedding(text: string): Promise<Array<number>> | Array<number>
 * - generateEmbeddings(texts: Array<string>): Promise<Array<Array<number>>> | Array<Array<number>>
 */

export class EmbeddingProvider {
  constructor(name = "base-provider", dimensions = 64) {
    if (new.target === EmbeddingProvider) {
      throw new TypeError("Cannot instantiate abstract class EmbeddingProvider directly.");
    }
    this.name = name;
    this.dimensions = dimensions;
  }

  getDimensions() {
    return this.dimensions;
  }

  generateEmbedding(_text) {
    throw new Error("Method 'generateEmbedding()' must be implemented by subclass.");
  }

  generateEmbeddings(texts = []) {
    return texts.map((t) => this.generateEmbedding(t));
  }
}

export default EmbeddingProvider;
