/**
 * @file indexedDbVectorStore.js
 * @description Low-Level Versioned IndexedDB Vector & Document Storage Engine for AI Engineer OS RAG.
 * Handles database connection lifecycle (AIEngineerOS_RAG_v1), version upgrades, schema indexing,
 * and asynchronous transactional CRUD operations for documents and 64-dimensional vector chunks.
 *
 * Responsibilities:
 * - Creates and manages IndexedDB object stores (`documents` and `chunks`).
 * - Manages compound indexes (`contentHash`, `status`, `docId`) for ultra-fast lookup.
 * - Provides batched transaction writes for high throughput chunk persistence.
 * - Offers atomic multi-store cascade deletions for document cleanup.
 * - Computes real-time vector database metrics (document count, chunk count, embedding count).
 *
 * Public API:
 * - initDB(): Promise<IDBDatabase>
 * - saveDocument(docRecord: Object): Promise<void>
 * - getDocument(docId: string): Promise<Object|null>
 * - getAllDocuments(): Promise<Array<Object>>
 * - deleteDocument(docId: string): Promise<void>
 * - saveChunks(chunksArray: Array<Object>): Promise<void>
 * - getChunksByDocId(docId: string): Promise<Array<Object>>
 * - getAllChunks(): Promise<Array<Object>>
 * - getChunkByHash(contentHash: string): Promise<Object|null>
 * - clearAllData(): Promise<void>
 * - getStats(): Promise<{ documentCount: number, chunkCount: number, embeddingCount: number }>
 *
 * Example Usage:
 * ```javascript
 * import indexedDbVectorStore from "./indexedDbVectorStore.js";
 *
 * await indexedDbVectorStore.saveDocument({ id: "doc_1", title: "Guide.pdf", status: "Completed" });
 * await indexedDbVectorStore.saveChunks([{ id: "chunk_1", docId: "doc_1", text: "Hello", embedding: [...] }]);
 * const stats = await indexedDbVectorStore.getStats();
 * console.log(stats.documentCount, stats.chunkCount);
 * ```
 */

import ragLogger from "../ragLogger.js";

const DB_NAME = "AIEngineerOS_RAG_v1";
const DB_VERSION = 1;

export class IndexedDbVectorStore {
  constructor() {
    /** @type {IDBDatabase|null} */
    this.db = null;
    /** @type {Promise<IDBDatabase>|null} */
    this.initPromise = null;
  }

  /**
   * Initializes and opens versioned IndexedDB database with schema migrations.
   * Ensures singleton database instance connection.
   * @returns {Promise<IDBDatabase>} Opened IndexedDB instance.
   */
  async initDB() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        const err = new Error("IndexedDB is not supported in this environment.");
        ragLogger.error("IndexedDB unavailable:", err);
        return reject(err);
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        ragLogger.info(`Upgrading IndexedDB schema to version ${DB_VERSION}...`);

        // Create 'documents' store if missing
        if (!db.objectStoreNames.contains("documents")) {
          const docStore = db.createObjectStore("documents", { keyPath: "id" });
          docStore.createIndex("contentHash", "contentHash", { unique: false });
          docStore.createIndex("status", "status", { unique: false });
        }

        // Create 'chunks' store if missing
        if (!db.objectStoreNames.contains("chunks")) {
          const chunkStore = db.createObjectStore("chunks", { keyPath: "id" });
          chunkStore.createIndex("docId", "docId", { unique: false });
          chunkStore.createIndex("contentHash", "contentHash", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        ragLogger.info(`IndexedDB "${DB_NAME}" initialized successfully.`);
        resolve(this.db);
      };

      request.onerror = (event) => {
        ragLogger.error("Failed to open IndexedDB:", event.target.error);
        this.initPromise = null;
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  /**
   * Helper to retrieve object store within an active transaction.
   * @param {string} storeName - Name of target object store ('documents' | 'chunks').
   * @param {IDBTransactionMode} [mode="readonly"] - Transaction access mode.
   * @returns {Promise<IDBObjectStore>}
   */
  async getStore(storeName, mode = "readonly") {
    const db = await this.initDB();
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  /**
   * Saves or updates document metadata record.
   * @param {Object} docRecord - Document record object containing `id`.
   * @returns {Promise<void>}
   */
  async saveDocument(docRecord) {
    if (!docRecord || !docRecord.id) {
      throw new Error("Invalid document record: missing required 'id' field.");
    }
    try {
      const store = await this.getStore("documents", "readwrite");
      return new Promise((resolve, reject) => {
        const request = store.put(docRecord);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      ragLogger.error(`Error saving document "${docRecord?.id}":`, err);
      throw err;
    }
  }

  /**
   * Retrieves document record by ID.
   * @param {string} docId - Document ID.
   * @returns {Promise<Object|null>} Document metadata object or null if not found.
   */
  async getDocument(docId) {
    if (!docId) return null;
    try {
      const store = await this.getStore("documents", "readonly");
      return new Promise((resolve, reject) => {
        const request = store.get(docId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      ragLogger.error(`Error fetching document "${docId}":`, err);
      return null;
    }
  }

  /**
   * Retrieves all document records from the database.
   * @returns {Promise<Array<Object>>} Array of document objects.
   */
  async getAllDocuments() {
    try {
      const store = await this.getStore("documents", "readonly");
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      ragLogger.error("Error fetching all documents:", err);
      return [];
    }
  }

  /**
   * Deletes a document record and all associated vector chunks atomically.
   * @param {string} docId - Document ID to delete.
   * @returns {Promise<void>}
   */
  async deleteDocument(docId) {
    if (!docId) return;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(["documents", "chunks"], "readwrite");
        const docStore = tx.objectStore("documents");
        const chunkStore = tx.objectStore("chunks");

        docStore.delete(docId);

        const chunkIndex = chunkStore.index("docId");
        const getKeysReq = chunkIndex.getAllKeys(docId);

        getKeysReq.onsuccess = () => {
          const keys = getKeysReq.result || [];
          keys.forEach((key) => chunkStore.delete(key));
        };

        tx.oncomplete = () => {
          ragLogger.info(`Deleted document "${docId}" and associated chunks from IndexedDB.`);
          resolve();
        };
        tx.onerror = (e) => reject(e.target.error);
        tx.onabort = (e) => reject(e.target.error || new Error("Transaction aborted"));
      });
    } catch (err) {
      ragLogger.error(`Error deleting document "${docId}":`, err);
      throw err;
    }
  }

  /**
   * Saves an array of vector chunks in a single batched readwrite transaction.
   * @param {Array<Object>} chunks - Array of chunk objects containing `id`, `docId`, `text`, and `embedding`.
   * @returns {Promise<void>}
   */
  async saveChunks(chunks = []) {
    if (!chunks || chunks.length === 0) return;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("chunks", "readwrite");
        const store = tx.objectStore("chunks");

        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
        tx.onabort = (e) => reject(e.target.error || new Error("Transaction aborted"));

        chunks.forEach((chunk) => {
          store.put(chunk);
        });
      });
    } catch (err) {
      ragLogger.error("Error saving chunks to IndexedDB:", err);
      throw err;
    }
  }

  /**
   * Retrieves all vector chunks belonging to a specific document ID.
   * @param {string} docId - Target document ID.
   * @returns {Promise<Array<Object>>} Array of matching chunk objects.
   */
  async getChunksByDocId(docId) {
    if (!docId) return [];
    try {
      const store = await this.getStore("chunks", "readonly");
      const index = store.index("docId");
      return new Promise((resolve, reject) => {
        const request = index.getAll(docId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      ragLogger.error(`Error fetching chunks for docId "${docId}":`, err);
      return [];
    }
  }

  /**
   * Retrieves all vector chunks across all documents in the database.
   * @returns {Promise<Array<Object>>} Array of all chunk objects.
   */
  async getAllChunks() {
    try {
      const store = await this.getStore("chunks", "readonly");
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      ragLogger.error("Error fetching all chunks:", err);
      return [];
    }
  }

  /**
   * Performs an index lookup for a chunk matching a specific content hash.
   * Used for content deduplication and vector cache lookup.
   * @param {string} contentHash - Content hash string.
   * @returns {Promise<Object|null>} Matching chunk object or null.
   */
  async getChunkByHash(contentHash) {
    if (!contentHash) return null;
    try {
      const store = await this.getStore("chunks", "readonly");
      const index = store.index("contentHash");
      return new Promise((resolve, reject) => {
        const request = index.get(contentHash);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      ragLogger.error(`Error looking up chunk by contentHash "${contentHash}":`, err);
      return null;
    }
  }

  /**
   * Clears all data from both 'documents' and 'chunks' object stores.
   * @returns {Promise<void>}
   */
  async clearAllData() {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(["documents", "chunks"], "readwrite");
        tx.objectStore("documents").clear();
        tx.objectStore("chunks").clear();

        tx.oncomplete = () => {
          ragLogger.info("Cleared all IndexedDB RAG data.");
          resolve();
        };
        tx.onerror = (e) => reject(e.target.error);
        tx.onabort = (e) => reject(e.target.error || new Error("Transaction aborted"));
      });
    } catch (err) {
      ragLogger.error("Error clearing IndexedDB data:", err);
      throw err;
    }
  }

  /**
   * Calculates vector database storage statistics.
   * @returns {Promise<{ documentCount: number, chunkCount: number, embeddingCount: number }>}
   */
  async getStats() {
    try {
      const docs = await this.getAllDocuments();
      const chunks = await this.getAllChunks();
      const embeddingCount = chunks.filter((c) => Array.isArray(c.embedding) && c.embedding.length > 0).length;
      return {
        documentCount: docs.length,
        chunkCount: chunks.length,
        embeddingCount,
      };
    } catch (err) {
      ragLogger.error("Error calculating IndexedDB metrics:", err);
      return { documentCount: 0, chunkCount: 0, embeddingCount: 0 };
    }
  }
}

export const indexedDbVectorStore = new IndexedDbVectorStore();
export default indexedDbVectorStore;
