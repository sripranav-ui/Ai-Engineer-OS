/**
 * @file ragManager.js
 * @description Master RAG Pipeline Orchestrator & Processing Queue Manager.
 * Manages asynchronous document ingestion queue (enqueue, pause, resume, cancel), off-thread Web Worker,
 * content-hash embedding caching, storage adapter persistence, settings, and performance metrics.
 *
 * Public API:
 * - getSettings(): Object
 * - saveSettings(newSettings): Object
 * - enqueueFile(file: File): Promise<{ jobId: string, docId: string }>
 * - pauseQueue(): void
 * - resumeQueue(): void
 * - cancelJob(jobId: string): void
 * - deleteDocument(docId: string): Promise<void>
 * - reindexDocument(docId: string): Promise<void>
 * - reindexAllDocuments(): Promise<void>
 * - subscribe(callback): Function (unsubscribe)
 * - subscribeProgress(callback): Function (unsubscribe)
 * - unsubscribe(callback): void
 * - getLibraryStats(): Promise<Object>
 * - getPerformanceMetrics(): Object
 */

import storageAdapter from "../memory/storage/storageAdapter.js";
import documentParser from "./documentParser.js";
import chunkingService from "./chunkingService.js";
import embeddingService from "./embeddingService.js";
import vectorStorageAdapter from "./storage/vectorStorageAdapter.js";
import retrievalService from "./retrievalService.js";
import ragLogger from "./ragLogger.js";

const RAG_SETTINGS_KEY = "rag_local_settings_v1";

const DEFAULT_SETTINGS = {
  chunkSize: 500,
  chunkOverlap: 100,
  topK: 4,
  similarityThreshold: 0.15,
  autoIndex: true,
};

export class RAGManager {
  constructor() {
    this.queue = [];
    this.activeJob = null;
    this.isPaused = false;
    this.subscribers = new Set();
    this.worker = null;

    // Performance metrics tracker
    this.metrics = {
      indexingTimes: [],
      retrievalTimes: [],
      totalDocumentsIndexed: 0,
      totalEmbeddingsGenerated: 0,
    };

    this.initWorker();
  }

  /** Initialize Web Worker instance */
  initWorker() {
    if (typeof window !== "undefined" && window.Worker) {
      try {
        const workerBlob = new Blob([this.getWorkerScriptContent()], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(workerBlob);
        this.worker = new Worker(workerUrl);

        this.worker.onmessage = (event) => this.handleWorkerMessage(event.data);
        this.worker.onerror = (err) => ragLogger.error("RAG Web Worker error:", err);
      } catch (err) {
        ragLogger.warn("Web Worker instantiation fallback to main-thread async processing:", err);
        this.worker = null;
      }
    }
  }

  /** Settings Management */
  getSettings() {
    return storageAdapter.get(RAG_SETTINGS_KEY, DEFAULT_SETTINGS);
  }

  saveSettings(newSettings = {}) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    storageAdapter.set(RAG_SETTINGS_KEY, updated);
    ragLogger.info("Saved RAG pipeline settings:", updated);
    return updated;
  }

  /** Subscription Management */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.add(callback);
      return () => this.unsubscribe(callback);
    }
    return () => {};
  }

  subscribeProgress(callback) {
    return this.subscribe(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notifySubscribers(eventData) {
    this.subscribers.forEach((cb) => {
      try {
        cb(eventData);
      } catch (err) {
        ragLogger.error("Subscriber notification callback error:", err);
      }
    });
  }

  /**
   * Enqueue uploaded file for asynchronous multi-stage indexing
   * @param {File} file
   * @returns {Promise<{ jobId: string, docId: string }>}
   */
  async enqueueFile(file) {
    if (!file) {
      throw new Error("No file provided for ingestion");
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Parse document text and check for errors
    const parsed = await documentParser.parseFile(file);

    if (parsed.error || !parsed.text) {
      const failedDoc = {
        id: docId,
        title: parsed.title || file.name || "Untitled Document",
        type: parsed.type || "unknown",
        pageCount: 0,
        characterCount: 0,
        contentHash: parsed.contentHash || "error_parsing",
        status: "Failed",
        error: parsed.error || "Document contains no readable text",
        createdAt: new Date().toISOString(),
        lastIndexedAt: new Date().toISOString(),
        metrics: { indexingTimeMs: 0, chunkCount: 0, embeddingCount: 0 },
      };

      await vectorStorageAdapter.saveDocument(failedDoc);
      this.notifySubscribers({ type: "ERROR", jobId, docId, title: failedDoc.title, error: failedDoc.error });
      throw new Error(failedDoc.error);
    }

    const docRecord = {
      id: docId,
      title: parsed.title,
      type: parsed.type,
      pageCount: parsed.pageCount,
      characterCount: parsed.text.length,
      contentHash: parsed.contentHash,
      status: "Queued",
      createdAt: new Date().toISOString(),
      lastIndexedAt: new Date().toISOString(),
      fileText: parsed.text,
      metrics: { indexingTimeMs: 0, chunkCount: 0, embeddingCount: 0 },
    };

    // Save initial Queued state to storage
    await vectorStorageAdapter.saveDocument(docRecord);

    // CACHE CHECK: Look for identical content hash in IndexedDB
    const existingDocs = await vectorStorageAdapter.getDocuments();
    const cachedDoc = existingDocs.find(
      (d) => d.contentHash === parsed.contentHash && d.status === "Completed" && d.id !== docId
    );

    if (cachedDoc) {
      ragLogger.info(`Content hash match found (${parsed.contentHash}). Reusing cached embeddings from document "${cachedDoc.title}".`);
      this.notifySubscribers({ type: "PROGRESS", jobId, docId, stage: "Saving", percent: 80, status: "Reusing cached vector embeddings..." });

      const cachedChunks = await vectorStorageAdapter.getChunksByDocId(cachedDoc.id);
      const newChunks = cachedChunks.map((c, i) => ({
        ...c,
        id: `chunk_${docId}_${i}`,
        docId,
        docTitle: docRecord.title,
        createdAt: new Date().toISOString(),
      }));

      docRecord.status = "Completed";
      docRecord.metrics = { indexingTimeMs: 10, chunkCount: newChunks.length, embeddingCount: newChunks.length };
      await vectorStorageAdapter.saveDocument(docRecord);
      await vectorStorageAdapter.saveChunks(newChunks);

      this.metrics.totalDocumentsIndexed++;
      this.metrics.totalEmbeddingsGenerated += newChunks.length;
      this.metrics.indexingTimes.push(10);

      this.notifySubscribers({ type: "COMPLETE", jobId, docId, result: { docRecord, chunkCount: newChunks.length } });
      return { jobId, docId };
    }

    const job = {
      jobId,
      docId,
      file,
      docRecord,
      parsed,
    };

    this.queue.push(job);
    this.notifySubscribers({ type: "QUEUED", jobId, docId, title: parsed.title, queueLength: this.queue.length });

    this.processNextJob();
    return { jobId, docId };
  }

  /** Queue Controls */
  pauseQueue() {
    this.isPaused = true;
    ragLogger.info("RAG Processing Queue paused.");
    this.notifySubscribers({ type: "QUEUE_PAUSED" });
  }

  resumeQueue() {
    this.isPaused = false;
    ragLogger.info("RAG Processing Queue resumed.");
    this.notifySubscribers({ type: "QUEUE_RESUMED" });
    this.processNextJob();
  }

  cancelJob(jobId) {
    // Cancel active job
    if (this.activeJob && this.activeJob.jobId === jobId) {
      if (this.worker) {
        this.worker.postMessage({ type: "CANCEL", jobId });
      }
      this.updateDocStatus(this.activeJob.docId, "Cancelled");
      this.activeJob = null;
      this.notifySubscribers({ type: "JOB_CANCELLED", jobId });
      this.processNextJob();
      return;
    }

    // Cancel pending queued job
    const idx = this.queue.findIndex((j) => j.jobId === jobId);
    if (idx !== -1) {
      const removed = this.queue.splice(idx, 1)[0];
      this.updateDocStatus(removed.docId, "Cancelled");
      this.notifySubscribers({ type: "JOB_CANCELLED", jobId });
    }
  }

  async updateDocStatus(docId, status) {
    try {
      const doc = await vectorStorageAdapter.getDocument(docId);
      if (doc) {
        doc.status = status;
        await vectorStorageAdapter.saveDocument(doc);
      }
    } catch (err) {
      ragLogger.error(`Failed to update document status "${docId}":`, err);
    }
  }

  async processNextJob() {
    if (this.isPaused || this.activeJob || this.queue.length === 0) return;

    this.activeJob = this.queue.shift();
    const { jobId, docId, docRecord, parsed } = this.activeJob;
    const settings = this.getSettings();

    ragLogger.info(`Processing background job "${jobId}" for document "${docRecord.title}"...`);

    if (this.worker) {
      await this.updateDocStatus(docId, "Parsing");
      this.notifySubscribers({ type: "PROGRESS", jobId, docId, stage: "Parsing", percent: 15, status: "Extracting document content..." });
      
      this.worker.postMessage({
        type: "START_INDEXING",
        jobId,
        payload: {
          docId,
          fileName: docRecord.title,
          fileText: docRecord.fileText,
          fileType: docRecord.type,
          pageCount: docRecord.pageCount,
          options: { chunkSize: settings.chunkSize, chunkOverlap: settings.chunkOverlap },
        },
      });
    } else {
      this.processJobAsync(jobId, docRecord, parsed, settings);
    }
  }

  async handleWorkerMessage(data) {
    const { type, jobId, stage, percent, status, result, error } = data || {};
    if (!this.activeJob || this.activeJob.jobId !== jobId) return;

    const docId = this.activeJob.docId;

    if (type === "PROGRESS") {
      await this.updateDocStatus(docId, stage);
      this.notifySubscribers({ type: "PROGRESS", jobId, docId, stage, percent, status });
    } else if (type === "COMPLETE") {
      const { docRecord, embeddedChunks, metrics } = result;

      await vectorStorageAdapter.saveDocument(docRecord);
      await vectorStorageAdapter.saveChunks(embeddedChunks);

      this.metrics.totalDocumentsIndexed++;
      this.metrics.totalEmbeddingsGenerated += embeddedChunks.length;
      this.metrics.indexingTimes.push(metrics.indexingTimeMs);

      ragLogger.info(`Indexed document "${docRecord.title}" in ${metrics.indexingTimeMs}ms (${embeddedChunks.length} chunks).`);

      this.notifySubscribers({ type: "COMPLETE", jobId, docId, result });
      this.activeJob = null;
      this.processNextJob();
    } else if (type === "ERROR") {
      ragLogger.error(`Indexing failed for job "${jobId}":`, error);
      await this.updateDocStatus(docId, "Failed");
      this.notifySubscribers({ type: "ERROR", jobId, docId, error });
      this.activeJob = null;
      this.processNextJob();
    } else if (type === "CANCELLED") {
      await this.updateDocStatus(docId, "Cancelled");
      this.notifySubscribers({ type: "JOB_CANCELLED", jobId, docId });
      this.activeJob = null;
      this.processNextJob();
    }
  }

  /** Main thread async execution fallback */
  async processJobAsync(jobId, docRecord, parsed, settings) {
    const startTime = performance.now();
    try {
      await this.updateDocStatus(docRecord.id, "Parsing");
      this.notifySubscribers({ type: "PROGRESS", jobId, docId: docRecord.id, stage: "Parsing", percent: 20, status: "Parsing text..." });

      await this.updateDocStatus(docRecord.id, "Chunking");
      this.notifySubscribers({ type: "PROGRESS", jobId, docId: docRecord.id, stage: "Chunking", percent: 40, status: "Chunking text..." });

      const chunks = chunkingService.chunkDocument(
        { ...docRecord, text: parsed.text },
        { chunkSize: settings.chunkSize, chunkOverlap: settings.chunkOverlap }
      );

      await this.updateDocStatus(docRecord.id, "Embedding");
      this.notifySubscribers({ type: "PROGRESS", jobId, docId: docRecord.id, stage: "Embedding", percent: 65, status: "Generating 64-dim embeddings..." });

      const embeddedChunks = chunks.map((c) => ({
        ...c,
        embedding: embeddingService.generateEmbedding(c.text, 64),
      }));

      await this.updateDocStatus(docRecord.id, "Saving");
      this.notifySubscribers({ type: "PROGRESS", jobId, docId: docRecord.id, stage: "Saving", percent: 90, status: "Persisting to storage..." });

      const totalTimeMs = Math.round(performance.now() - startTime);

      const finalDoc = {
        ...docRecord,
        status: "Completed",
        metrics: { indexingTimeMs: totalTimeMs, chunkCount: embeddedChunks.length, embeddingCount: embeddedChunks.length },
      };

      await vectorStorageAdapter.saveDocument(finalDoc);
      await vectorStorageAdapter.saveChunks(embeddedChunks);

      this.metrics.totalDocumentsIndexed++;
      this.metrics.totalEmbeddingsGenerated += embeddedChunks.length;
      this.metrics.indexingTimes.push(totalTimeMs);

      this.notifySubscribers({ type: "COMPLETE", jobId, docId: docRecord.id, result: { docRecord: finalDoc, chunkCount: embeddedChunks.length } });
    } catch (err) {
      ragLogger.error("Async job processing failed:", err);
      await this.updateDocStatus(docRecord.id, "Failed");
      this.notifySubscribers({ type: "ERROR", jobId, docId: docRecord.id, error: err.message });
    } finally {
      this.activeJob = null;
      this.processNextJob();
    }
  }

  async deleteDocument(docId) {
    await vectorStorageAdapter.deleteDocument(docId);
    this.notifySubscribers({ type: "DOC_DELETED", docId });
  }

  async reindexDocument(docId) {
    const doc = await vectorStorageAdapter.getDocument(docId);
    if (!doc) throw new Error("Document not found in storage");

    const chunks = await vectorStorageAdapter.getChunksByDocId(docId);
    const text = doc.fileText || chunks.map((c) => c.text).join("\n\n");
    if (!text) throw new Error("No readable text content found for document re-indexing");

    const settings = this.getSettings();
    await this.updateDocStatus(docId, "Chunking");

    const newChunks = chunkingService.chunkDocument(
      { ...doc, text },
      { chunkSize: settings.chunkSize, chunkOverlap: settings.chunkOverlap }
    );

    await this.updateDocStatus(docId, "Embedding");
    const reEmbedded = newChunks.map((c) => ({
      ...c,
      embedding: embeddingService.generateEmbedding(c.text, 64),
    }));

    await this.updateDocStatus(docId, "Saving");
    doc.status = "Completed";
    doc.lastIndexedAt = new Date().toISOString();
    doc.metrics = { indexingTimeMs: 50, chunkCount: reEmbedded.length, embeddingCount: reEmbedded.length };

    await vectorStorageAdapter.saveDocument(doc);
    await vectorStorageAdapter.saveChunks(reEmbedded);
    this.notifySubscribers({ type: "DOC_REINDEXED", docId });
  }

  async reindexAllDocuments() {
    const docs = await vectorStorageAdapter.getDocuments();
    for (const doc of docs) {
      try {
        await this.reindexDocument(doc.id);
      } catch (err) {
        ragLogger.warn(`Failed to reindex document "${doc.id}":`, err);
      }
    }
  }

  async retrieveContext(query, options = {}) {
    const settings = this.getSettings();
    const combinedOptions = {
      topK: settings.topK,
      similarityThreshold: settings.similarityThreshold,
      ...options,
    };

    const startTime = performance.now();
    const result = await retrievalService.search(query, combinedOptions);
    const durationMs = Math.round(performance.now() - startTime);

    this.metrics.retrievalTimes.push(durationMs);
    return result;
  }

  async getLibraryStats() {
    return await vectorStorageAdapter.getStats();
  }

  async getDocuments() {
    return await vectorStorageAdapter.getDocuments();
  }

  getPerformanceMetrics() {
    const avgIndexingTime =
      this.metrics.indexingTimes.length > 0
        ? Math.round(this.metrics.indexingTimes.reduce((a, b) => a + b, 0) / this.metrics.indexingTimes.length)
        : 0;

    const avgRetrievalTime =
      this.metrics.retrievalTimes.length > 0
        ? Math.round(this.metrics.retrievalTimes.reduce((a, b) => a + b, 0) / this.metrics.retrievalTimes.length)
        : 0;

    return {
      avgIndexingTimeMs: avgIndexingTime,
      avgRetrievalTimeMs: avgRetrievalTime,
      totalDocumentsIndexed: this.metrics.totalDocumentsIndexed,
      totalEmbeddingsGenerated: this.metrics.totalEmbeddingsGenerated,
    };
  }

  /** Inline Worker Script Generator */
  getWorkerScriptContent() {
    return `
      function computeContentHash(text) {
        if (!text) return "empty_0";
        let hash1 = 0x811c9dc5, hash2 = 0x5bd1e995;
        for (let i = 0; i < text.length; i++) {
          const c = text.charCodeAt(i);
          hash1 = Math.imul(hash1 ^ c, 16777619);
          hash2 = Math.imul(hash2 ^ c, 0x5bd1e995);
        }
        return "fnv_" + (hash1 >>> 0).toString(16) + "_" + (hash2 >>> 0).toString(16) + "_" + text.length;
      }
      function generateLocalEmbedding(text, dimensions) {
        dimensions = dimensions || 64;
        var vector = new Array(dimensions).fill(0);
        if (!text) return vector;
        var normalized = text.toLowerCase().replace(/[^a-z0-9\\s]/g, " ");
        var words = normalized.split(/\\s+/).filter(function(w) { return w.length > 1; });
        if (words.length === 0) return vector;
        for (var i = 0; i < words.length; i++) {
          var word = words[i];
          var h1 = 0x811c9dc5;
          for (var j = 0; j < word.length; j++) {
            h1 ^= word.charCodeAt(j);
            h1 += (h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24);
          }
          vector[Math.abs(h1) % dimensions] += 1.0;
        }
        var normSq = 0;
        for (var k = 0; k < dimensions; k++) normSq += vector[k] * vector[k];
        var norm = Math.sqrt(normSq);
        if (norm > 0) {
          for (var m = 0; m < dimensions; m++) vector[m] /= norm;
        }
        return vector;
      }
      function chunkText(docId, docTitle, text, chunkSize, chunkOverlap, pageCount) {
        chunkSize = chunkSize || 500;
        chunkOverlap = chunkOverlap || 100;
        var chunks = [];
        if (!text) return chunks;
        var start = 0, chunkIndex = 0;
        var totalPages = Math.max(1, pageCount || 1);
        var charsPerPage = Math.max(100, Math.ceil(text.length / totalPages));
        while (start < text.length) {
          var end = start + chunkSize;
          if (end < text.length) {
            var dotIdx = Math.max(text.lastIndexOf(".", end), text.lastIndexOf("\n", end));
            if (dotIdx > start + chunkSize * 0.5) end = dotIdx + 1;
            else {
              var spIdx = text.lastIndexOf(" ", end);
              if (spIdx > start + chunkSize * 0.5) end = spIdx + 1;
            }
          }
          var cText = text.substring(start, end).trim();
          var pNum = Math.min(totalPages, Math.floor(start / charsPerPage) + 1);
          if (cText.length > 5) {
            chunks.push({
              id: "chunk_" + docId + "_" + chunkIndex,
              docId: docId,
              docTitle: docTitle || "Untitled Document",
              pageNumber: pNum,
              chunkIndex: chunkIndex,
              text: cText,
              characterCount: cText.length,
              contentHash: computeContentHash(cText),
              createdAt: new Date().toISOString()
            });
            chunkIndex++;
          }
          start += Math.max(50, (end - start) - chunkOverlap);
        }
        return chunks;
      }
      var activeJobId = null;
      self.onmessage = function(e) {
        var data = e.data || {};
        if (data.type === "CANCEL") {
          if (activeJobId === data.jobId) {
            activeJobId = null;
            self.postMessage({ type: "CANCELLED", jobId: data.jobId });
          }
          return;
        }
        if (data.type === "START_INDEXING") {
          var jobId = data.jobId;
          activeJobId = jobId;
          var p = data.payload;
          var t0 = performance.now();
          self.postMessage({ type: "PROGRESS", jobId: jobId, stage: "Parsing", percent: 15, status: "Parsing document structure..." });
          if (activeJobId !== jobId) return;
          var chunks = chunkText(p.docId, p.fileName, p.fileText, p.options.chunkSize, p.options.chunkOverlap, p.pageCount);
          if (activeJobId !== jobId) return;
          self.postMessage({ type: "PROGRESS", jobId: jobId, stage: "Embedding", percent: 55, status: "Generating 64-dim vector embeddings..." });
          var embedded = chunks.map(function(c) {
            return Object.assign({}, c, { embedding: generateLocalEmbedding(c.text, 64) });
          });
          if (activeJobId !== jobId) return;
          self.postMessage({ type: "PROGRESS", jobId: jobId, stage: "Saving", percent: 90, status: "Saving to store..." });
          var dt = Math.round(performance.now() - t0);
          self.postMessage({
            type: "COMPLETE",
            jobId: jobId,
            result: {
              docRecord: {
                id: p.docId,
                title: p.fileName,
                type: p.fileType || "txt",
                pageCount: p.pageCount || 1,
                characterCount: p.fileText.length,
                contentHash: computeContentHash(p.fileText),
                status: "Completed",
                createdAt: new Date().toISOString(),
                lastIndexedAt: new Date().toISOString(),
                metrics: { indexingTimeMs: dt, chunkCount: embedded.length, embeddingCount: embedded.length }
              },
              embeddedChunks: embedded,
              metrics: { indexingTimeMs: dt, chunkCount: embedded.length }
            }
          });
        }
      };
    `;
  }
}

export const ragManager = new RAGManager();
export default ragManager;
