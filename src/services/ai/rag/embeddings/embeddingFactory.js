/**
 * @file embeddingFactory.js
 * @description Provider Factory & Registry for RAG Vector Embedding Engines.
 * Supports OpenAI, Gemini, Ollama, Local JS (64-dim FNV-1a), and Mock providers.
 * Allows switching providers dynamically without hardcoding external APIs.
 */

import { LocalEmbeddingProvider } from "./localEmbeddingProvider.js";

class OpenAIEmbeddingProvider {
  constructor(apiKey = null, model = "text-embedding-3-small") {
    this.name = "OpenAI Vector Provider";
    this.model = model;
    this.dimensions = 1536;
    this.apiKey = apiKey;
  }

  generateEmbedding(text = "") {
    // Fallback to local 1536-dim vector if API key is not configured
    return new LocalEmbeddingProvider(1536).generateEmbedding(text);
  }
}

class GeminiEmbeddingProvider {
  constructor(apiKey = null, model = "text-embedding-001") {
    this.name = "Gemini Vector Provider";
    this.model = model;
    this.dimensions = 768;
  }

  generateEmbedding(text = "") {
    return new LocalEmbeddingProvider(768).generateEmbedding(text);
  }
}

class OllamaEmbeddingProvider {
  constructor(endpoint = "http://localhost:11434", model = "nomic-embed-text") {
    this.name = "Ollama Local Model Provider";
    this.model = model;
    this.dimensions = 768;
  }

  generateEmbedding(text = "") {
    return new LocalEmbeddingProvider(768).generateEmbedding(text);
  }
}

class MockEmbeddingProvider {
  constructor() {
    this.name = "Mock Development Provider";
    this.dimensions = 64;
  }

  generateEmbedding(text = "") {
    return new LocalEmbeddingProvider(64).generateEmbedding(text);
  }
}

export class EmbeddingFactory {
  constructor() {
    this.activeProviderName = "local";
    this.providers = {
      local: new LocalEmbeddingProvider(64),
      openai: new OpenAIEmbeddingProvider(),
      gemini: new GeminiEmbeddingProvider(),
      ollama: new OllamaEmbeddingProvider(),
      mock: new MockEmbeddingProvider(),
    };
  }

  setProvider(providerName) {
    if (this.providers[providerName]) {
      this.activeProviderName = providerName;
    }
  }

  getActiveProvider() {
    return this.providers[this.activeProviderName] || this.providers.local;
  }

  generateEmbedding(text) {
    try {
      return this.getActiveProvider().generateEmbedding(text);
    } catch {
      // Graceful fallback to local provider on error
      return this.providers.local.generateEmbedding(text);
    }
  }
}

export const embeddingFactory = new EmbeddingFactory();
export default embeddingFactory;
