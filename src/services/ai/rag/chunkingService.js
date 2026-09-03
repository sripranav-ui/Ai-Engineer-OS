/**
 * @file chunkingService.js
 * @description Local Text Chunking Service for AI Engineer OS RAG Engine.
 * Splits document text into overlapping text chunks with document ID, chunk ID,
 * page number, content hash, character count, and created timestamp metadata.
 *
 * Public API:
 * - chunkDocument(doc: Object, options?: Object): Array<Object>
 */

import embeddingService from "./embeddingService.js";

export class ChunkingService {
  /**
   * Splits document text into overlapping chunks with metadata
   * @param {Object} doc - Document object ({ id, title, text, type, pageCount, createdAt })
   * @param {Object} [options={}] - Chunking options ({ chunkSize: 500, chunkOverlap: 100 })
   * @returns {Array<Object>} Array of chunk objects
   */
  chunkDocument(doc, options = {}) {
    if (!doc || !doc.text) return [];

    const docId = doc.id || `doc_${Date.now()}`;
    const docTitle = doc.title || doc.docTitle || "Untitled Document";
    const chunkSize = Math.max(100, options.chunkSize ?? 500);
    const chunkOverlap = Math.max(0, Math.min(chunkSize - 50, options.chunkOverlap ?? 100));
    const text = typeof doc.text === "string" ? doc.text : String(doc.text);

    if (!text.trim()) return [];

    const chunks = [];
    let start = 0;
    let chunkIndex = 0;

    const totalDocPages = Math.max(1, doc.pageCount || 1);
    const charsPerPage = Math.max(100, Math.ceil(text.length / totalDocPages));

    while (start < text.length) {
      let end = start + chunkSize;

      // Try breaking at sentence or newline/paragraph boundary
      if (end < text.length) {
        const boundaryIndex = Math.max(
          text.lastIndexOf(".", end),
          text.lastIndexOf("?", end),
          text.lastIndexOf("!", end),
          text.lastIndexOf("\n", end)
        );
        if (boundaryIndex > start + chunkSize * 0.5) {
          end = boundaryIndex + 1;
        } else {
          const spaceIndex = text.lastIndexOf(" ", end);
          if (spaceIndex > start + chunkSize * 0.5) {
            end = spaceIndex + 1;
          }
        }
      }

      const chunkText = text.substring(start, end).trim();
      const pageNumber = Math.min(totalDocPages, Math.floor(start / charsPerPage) + 1);

      if (chunkText.length > 5) {
        const contentHash = embeddingService.computeContentHash(chunkText);
        chunks.push({
          id: `chunk_${docId}_${chunkIndex}`,
          chunkId: `chunk_${docId}_${chunkIndex}`,
          docId,
          documentId: docId,
          docTitle,
          pageNumber,
          chunkIndex,
          text: chunkText,
          startOffset: start,
          endOffset: end,
          characterCount: chunkText.length,
          tokenEstimate: Math.ceil(chunkText.length / 4),
          contentHash,
          createdAt: doc.createdAt || new Date().toISOString(),
        });
        chunkIndex++;
      }

      const advance = Math.max(50, (end - start) - chunkOverlap);
      start += advance;
    }

    return chunks;
  }
}

export const chunkingService = new ChunkingService();
export default chunkingService;
