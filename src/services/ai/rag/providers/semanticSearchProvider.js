/**
 * @file semanticSearchProvider.js
 * @description Abstract vector search interface adapter for embedding backends.
 */

import BaseRAGProvider from "./baseRAGProvider.js";

export class SemanticSearchProvider extends BaseRAGProvider {
  constructor() {
    super({ id: "semantic_search", name: "Semantic Vector Search Provider" });
  }

  async search(query, options = {}) {
    // Vector search abstraction interface stub
    return [];
  }
}

export default SemanticSearchProvider;
