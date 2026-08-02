/**
 * @file baseRAGProvider.js
 * @description Abstract Base Provider Interface contract for RAG Retrieval Sources.
 */

export class BaseRAGProvider {
  /**
   * Constructs BaseRAGProvider instance.
   * @param {Object} options
   * @param {string} options.id - Provider unique ID
   * @param {string} options.name - Display name
   */
  constructor({ id, name }) {
    if (!id || !name) throw new Error("BaseRAGProvider requires 'id' and 'name'.");
    this.id = id;
    this.name = name;
    this.active = true;
  }

  async initialize() {
    return true;
  }

  /**
   * Searches retrieval source.
   * @param {string} query
   * @param {Object} [options={}]
   * @returns {Promise<Object[]>}
   */
  async search(query, options = {}) {
    throw new Error(`search() not implemented for provider "${this.id}".`);
  }

  async health() {
    return { status: "OK", id: this.id };
  }

  async shutdown() {
    this.active = false;
  }
}

export default BaseRAGProvider;
