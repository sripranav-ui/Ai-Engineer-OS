/**
 * @file vectorStorageAdapter.js
 * @description Storage Abstraction Layer for AI Engineer OS RAG Engine.
 * Decouples the RAG core orchestrator and retrieval engine from low-level storage primitives.
 * Delegates vector and document storage operations to an injected storage backend (defaults to `indexedDbVectorStore`).
 *
 * Purpose:
 * - Provides a uniform, storage-agnostic interface for the RAG pipeline.
 * - Allows swapping low-level storage mechanisms (e.g., IndexedDB, Memory, SQLite-wasm) without modifying core RAG logic.
 * - Handles parameter validation and error logging via `ragLogger`.
 *
 * Responsibilities:
 * - Sanitizes input payloads for storage operations.
 * - Routes document and chunk CRUD commands to the active backend.
 * - Logs storage events for observability.
 *
 * Public API:
 * - getDocuments(): Promise<Array<Object>>
 * - getDocument(docId: string): Promise<Object|null>
 * - saveDocument(docRecord: Object): Promise<void>
 * - deleteDocument(docId: string): Promise<void>
 * - getChunks(): Promise<Array<Object>>
 * - getChunksByDocId(docId: string): Promise<Array<Object>>
 * - saveChunks(chunks: Array<Object>): Promise<void>
 * - getChunkByHash(contentHash: string): Promise<Object|null>
 * - clearStore(): Promise<void>
 * - getStats(): Promise<{ documentCount: number, chunkCount: number, embeddingCount: number }>
 *
 * Example Usage:
 * ```javascript
 * import vectorStorageAdapter from "./vectorStorageAdapter.js";
 *
 * const docs = await vectorStorageAdapter.getDocuments();
 * await vectorStorageAdapter.saveDocument({ id: "doc_101", title: "Architecture.md" });
 * const stats = await vectorStorageAdapter.getStats();
 * ```
 */

import indexedDbVectorStore from "./indexedDbVectorStore.js";
import ragLogger from "../ragLogger.js";

export class VectorStorageAdapter {
  /**
   * Constructs the adapter with a pluggable storage backend.
   * @param {Object} [storageBackend=indexedDbVectorStore] - Low-level storage implementation instance.
   */
  constructor(storageBackend = indexedDbVectorStore) {
    this.backend = storageBackend;
  }

  /**
   * Fetches all document records from storage.
   * @returns {Promise<Array<Object>>} List of stored document metadata records.
   */
  async getDocuments() {
    return await this.backend.getAllDocuments();
  }

  /**
   * Fetches a single document record by ID.
   * @param {string} docId - Target document ID.
   * @returns {Promise<Object|null>} Document record or null.
   */
  async getDocument(docId) {
    if (!docId) return null;
    return await this.backend.getDocument(docId);
  }

  /**
   * Saves or updates a document metadata record.
   * @param {Object} docRecord - Document record object.
   * @returns {Promise<void>}
   */
  async saveDocument(docRecord) {
    if (!docRecord || !docRecord.id) {
      throw new Error("[VectorStorageAdapter] Invalid document record: missing 'id'.");
    }
    await this.backend.saveDocument(docRecord);
    ragLogger.info(`[VectorStorageAdapter] Saved document "${docRecord.title || docRecord.id}" (${docRecord.id}).`);
  }

  /**
   * Deletes a document and its associated chunks from storage.
   * @param {string} docId - Target document ID.
   * @returns {Promise<void>}
   */
  async deleteDocument(docId) {
    if (!docId) return;
    await this.backend.deleteDocument(docId);
    ragLogger.info(`[VectorStorageAdapter] Deleted document "${docId}".`);
  }

  /**
   * Fetches all vector chunks stored across all documents.
   * @returns {Promise<Array<Object>>} Array of chunk objects.
   */
  async getChunks() {
    return await this.backend.getAllChunks();
  }

  /**
   * Fetches vector chunks belonging to a specific document ID.
   * @param {string} docId - Document ID filter.
   * @returns {Promise<Array<Object>>} Matching chunk objects.
   */
  async getChunksByDocId(docId) {
    if (!docId) return [];
    return await this.backend.getChunksByDocId(docId);
  }

  /**
   * Persists an array of vector chunks to storage.
   * @param {Array<Object>} [chunks=[]] - Array of chunk objects to persist.
   * @returns {Promise<void>}
   */
  async saveChunks(chunks = []) {
    if (!chunks || chunks.length === 0) return;
    await this.backend.saveChunks(chunks);
    ragLogger.info(`[VectorStorageAdapter] Saved ${chunks.length} chunk(s).`);
  }

  /**
   * Looks up a chunk by its deterministic content hash.
   * @param {string} contentHash - Content hash string.
   * @returns {Promise<Object|null>} Matching chunk object or null.
   */
  async getChunkByHash(contentHash) {
    if (!contentHash) return null;
    return await this.backend.getChunkByHash(contentHash);
  }

  /**
   * Clears all stored vector documents and chunks.
   * @returns {Promise<void>}
   */
  async clearStore() {
    await this.backend.clearAllData();
    ragLogger.info("[VectorStorageAdapter] Vector storage cleared.");
  }

  /**
   * Computes database metrics (document count, chunk count, embedding count).
   * @returns {Promise<{ documentCount: number, chunkCount: number, embeddingCount: number }>}
   */
  async getStats() {
    return await this.backend.getStats();
  }
}

export const vectorStorageAdapter = new VectorStorageAdapter();
export default vectorStorageAdapter;
