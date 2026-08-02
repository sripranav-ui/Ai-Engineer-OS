/**
 * @file ragWorker.js
 * @description Dedicated Web Worker for off-thread document text chunking and 64-dimensional vector embedding generation.
 * Supports asynchronous progress updates (Parsing -> Chunking -> Embedding -> Saving -> Completed) and job cancellation.
 */

/* eslint-disable no-restricted-globals */

function computeContentHash(text = "") {
  if (!text) return "empty_0";
  let hash1 = 0x811c9dc5;
  let hash2 = 0x5bd1e995;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ char, 16777619);
    hash2 = Math.imul(hash2 ^ char, 0x5bd1e995);
  }
  return `fnv_${(hash1 >>> 0).toString(16)}_${(hash2 >>> 0).toString(16)}_${text.length}`;
}

function generateLocalEmbedding(text = "", dimensions = 64) {
  const vector = new Array(dimensions).fill(0);
  if (!text || typeof text !== "string") return vector;

  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = normalized.split(/\s+/).filter((w) => w.length > 1);

  if (words.length === 0) return vector;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash1 = 0x811c9dc5;
    for (let j = 0; j < word.length; j++) {
      hash1 ^= word.charCodeAt(j);
      hash1 += (hash1 << 1) + (hash1 << 4) + (hash1 << 7) + (hash1 << 8) + (hash1 << 24);
    }
    const index1 = Math.abs(hash1) % dimensions;
    vector[index1] += 1.0;

    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let hash2 = 0x811c9dc5;
      for (let j = 0; j < bigram.length; j++) {
        hash2 ^= bigram.charCodeAt(j);
        hash2 += (hash2 << 1) + (hash2 << 4) + (hash2 << 7) + (hash2 << 8) + (hash2 << 24);
      }
      const index2 = Math.abs(hash2) % dimensions;
      vector[index2] += 1.5;
    }
  }

  let normSq = 0;
  for (let i = 0; i < dimensions; i++) {
    normSq += vector[i] * vector[i];
  }

  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

function chunkTextContent(docId, docTitle, text, chunkSize = 500, chunkOverlap = 100, pageCount = 1) {
  const chunks = [];
  if (!text) return chunks;

  let start = 0;
  let chunkIndex = 0;
  const totalDocPages = Math.max(1, pageCount);
  const charsPerPage = Math.max(100, Math.ceil(text.length / totalDocPages));

  while (start < text.length) {
    let end = start + chunkSize;

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
      const chunkHash = computeContentHash(chunkText);
      chunks.push({
        id: `chunk_${docId}_${chunkIndex}`,
        docId,
        docTitle: docTitle || "Untitled Document",
        pageNumber,
        chunkIndex,
        text: chunkText,
        characterCount: chunkText.length,
        contentHash: chunkHash,
        createdAt: new Date().toISOString(),
      });
      chunkIndex++;
    }

    const advance = Math.max(50, (end - start) - chunkOverlap);
    start += advance;
  }

  return chunks;
}

let activeJobId = null;

self.onmessage = async (event) => {
  const { type, jobId, payload } = event.data || {};

  if (type === "CANCEL") {
    if (activeJobId === jobId) {
      activeJobId = null;
      self.postMessage({ type: "CANCELLED", jobId });
    }
    return;
  }

  if (type === "START_INDEXING") {
    activeJobId = jobId;
    const { docId, fileName, fileText, fileType, pageCount, options } = payload || {};
    const startTime = performance.now();

    try {
      if (!fileText || typeof fileText !== "string") {
        throw new Error("No readable text content provided for indexing");
      }

      // Stage 1: Parsing confirmation
      self.postMessage({ type: "PROGRESS", jobId, stage: "Parsing", percent: 15, status: "Extracting and parsing document structure..." });

      if (activeJobId !== jobId) return;

      const contentHash = computeContentHash(fileText);

      // Stage 2: Chunking
      self.postMessage({ type: "PROGRESS", jobId, stage: "Chunking", percent: 35, status: "Splitting text into overlapping chunks..." });

      const chunkSize = options?.chunkSize || 500;
      const chunkOverlap = options?.chunkOverlap || 100;
      const chunks = chunkTextContent(docId, fileName, fileText, chunkSize, chunkOverlap, pageCount);

      if (activeJobId !== jobId) return;

      // Stage 3: Embedding
      self.postMessage({ type: "PROGRESS", jobId, stage: "Embedding", percent: 55, status: "Generating 64-dimensional vector embeddings..." });

      const embeddedChunks = [];
      for (let i = 0; i < chunks.length; i++) {
        if (activeJobId !== jobId) return;

        const chunk = chunks[i];
        const embedding = generateLocalEmbedding(chunk.text, 64);
        embeddedChunks.push({ ...chunk, embedding });

        if (chunks.length > 5 && i % Math.max(1, Math.floor(chunks.length / 5)) === 0) {
          const embPercent = Math.min(85, 55 + Math.floor((i / chunks.length) * 30));
          self.postMessage({
            type: "PROGRESS",
            jobId,
            stage: "Embedding",
            percent: embPercent,
            status: `Generating embedding for chunk ${i + 1}/${chunks.length}...`,
          });
        }
      }

      if (activeJobId !== jobId) return;

      // Stage 4: Saving
      self.postMessage({ type: "PROGRESS", jobId, stage: "Saving", percent: 90, status: "Persisting vector embeddings to storage..." });

      const totalTimeMs = Math.round(performance.now() - startTime);

      self.postMessage({
        type: "COMPLETE",
        jobId,
        result: {
          docRecord: {
            id: docId,
            title: fileName,
            type: fileType || "txt",
            pageCount: pageCount || 1,
            characterCount: fileText.length,
            contentHash,
            status: "Completed",
            createdAt: new Date().toISOString(),
            lastIndexedAt: new Date().toISOString(),
            metrics: {
              indexingTimeMs: totalTimeMs,
              chunkCount: embeddedChunks.length,
              embeddingCount: embeddedChunks.length,
            },
          },
          embeddedChunks,
          metrics: {
            indexingTimeMs: totalTimeMs,
            chunkCount: embeddedChunks.length,
          },
        },
      });
    } catch (err) {
      self.postMessage({ type: "ERROR", jobId, error: err.message || "Background worker processing error" });
    } finally {
      if (activeJobId === jobId) {
        activeJobId = null;
      }
    }
  }
};
