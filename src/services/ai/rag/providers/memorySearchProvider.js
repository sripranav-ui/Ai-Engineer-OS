/**
 * @file memorySearchProvider.js
 * @description RAG Provider searching Short-Term & Long-Term Memory.
 */

import BaseRAGProvider from "./baseRAGProvider.js";
import shortTermMemory from "../../memory/shortTermMemory.js";
import longTermMemory from "../../memory/longTermMemory.js";

export class MemorySearchProvider extends BaseRAGProvider {
  constructor() {
    super({ id: "memory_search", name: "AI Memory Search Provider" });
  }

  async search(query, options = {}) {
    const results = [];
    const st = shortTermMemory.getMemory();
    const lt = longTermMemory.getMemory();

    if (st.activePage) {
      results.push({
        id: "mem_active_page",
        text: `Active Page: ${st.activePage}`,
        sourceId: "active_page",
        sourceType: "Memory",
        provider: this.id,
        score: 90,
      });
    }

    if (lt.pinnedNotes && Array.isArray(lt.pinnedNotes)) {
      lt.pinnedNotes.forEach((p, idx) => {
        results.push({
          id: `mem_pinned_${idx}`,
          text: `Pinned Note: ${p.title || p.text}`,
          sourceId: p.id || `pinned_${idx}`,
          sourceType: "Memory",
          provider: this.id,
          score: 80,
        });
      });
    }

    return results;
  }
}

export default MemorySearchProvider;
