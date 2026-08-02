// =======================================================
// vectorStore.js — Local Vector Database Store
// =======================================================
// Stores document metadata, chunks, and vector embeddings.
// Persists using storageAdapter (localStorage) with IndexedDB fallback readiness.
// =======================================================

import storageAdapter from "../memory/storage/storageAdapter.js";
import logger from "../../../utils/logger.js";

const RAG_DOCUMENTS_KEY = "rag_local_documents_v1";
const RAG_CHUNKS_KEY = "rag_local_chunks_v1";

export class VectorStore {
  /** Get all registered documents */
  getDocuments() {
    return storageAdapter.get(RAG_DOCUMENTS_KEY, []);
  }

  /** Get all stored chunks with embeddings */
  getChunks() {
    return storageAdapter.get(RAG_CHUNKS_KEY, []);
  }

  /** Save document metadata and embedded chunks */
  saveDocument(docRecord, embeddedChunks = []) {
    const documents = this.getDocuments();
    const chunks = this.getChunks();

    // Replace if document already exists (re-indexing)
    const filteredDocs = documents.filter((d) => d.id !== docRecord.id);
    filteredDocs.unshift(docRecord);

    const filteredChunks = chunks.filter((c) => c.docId !== docRecord.id);
    const updatedChunks = [...embeddedChunks, ...filteredChunks];

    storageAdapter.set(RAG_DOCUMENTS_KEY, filteredDocs);
    storageAdapter.set(RAG_CHUNKS_KEY, updatedChunks);
    logger.info(`[VectorStore] Saved document "${docRecord.title}" with ${embeddedChunks.length} chunk(s).`);
  }

  /** Delete document and all associated chunks */
  deleteDocument(docId) {
    const documents = this.getDocuments();
    const chunks = this.getChunks();

    const updatedDocs = documents.filter((d) => d.id !== docId);
    const updatedChunks = chunks.filter((c) => c.docId !== docId);

    storageAdapter.set(RAG_DOCUMENTS_KEY, updatedDocs);
    storageAdapter.set(RAG_CHUNKS_KEY, updatedChunks);
    logger.info(`[VectorStore] Deleted document "${docId}".`);
  }

  /** Clear vector store */
  clearStore() {
    storageAdapter.remove(RAG_DOCUMENTS_KEY);
    storageAdapter.remove(RAG_CHUNKS_KEY);
    logger.info("[VectorStore] Vector store cleared.");
  }

  /** Get summary metrics */
  getStats() {
    const documents = this.getDocuments();
    const chunks = this.getChunks();
    return {
      documentCount: documents.length,
      chunkCount: chunks.length,
      embeddingCount: chunks.filter((c) => c.embedding && c.embedding.length > 0).length,
    };
  }
}

export const vectorStore = new VectorStore();
export default vectorStore;
