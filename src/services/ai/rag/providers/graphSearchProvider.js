/**
 * @file graphSearchProvider.js
 * @description RAG Provider searching Knowledge Graph nodes & relationships.
 */

import BaseRAGProvider from "./baseRAGProvider.js";
import contextRanker from "../../../intelligence/contextRanker.js";

export class GraphSearchProvider extends BaseRAGProvider {
  constructor() {
    super({ id: "graph_search", name: "Knowledge Graph Search Provider" });
  }

  async search(query, options = {}) {
    const nodes = contextRanker.rankNodes(query, options.limit || 5);
    return nodes.map((n) => ({
      id: `graph_${n.id}`,
      text: `${n.title} (${n.type})`,
      sourceId: n.id,
      sourceType: n.type,
      provider: this.id,
      score: 85,
      metadata: n.metadata,
      createdAt: n.createdAt || new Date().toISOString(),
    }));
  }
}

export default GraphSearchProvider;
