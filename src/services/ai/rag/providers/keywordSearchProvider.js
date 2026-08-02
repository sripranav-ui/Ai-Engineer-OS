/**
 * @file keywordSearchProvider.js
 * @description Full-text keyword search provider adapter.
 */

import BaseRAGProvider from "./baseRAGProvider.js";

export class KeywordSearchProvider extends BaseRAGProvider {
  constructor() {
    super({ id: "keyword_search", name: "Full-Text Keyword Search Provider" });
  }

  async search(query, options = {}) {
    return [
      {
        id: `kw_${Date.now()}`,
        text: `Keyword match for "${query}" in workspace docs`,
        sourceId: "kw_doc_1",
        sourceType: "Document",
        provider: this.id,
        score: 70,
      },
    ];
  }
}

export default KeywordSearchProvider;
