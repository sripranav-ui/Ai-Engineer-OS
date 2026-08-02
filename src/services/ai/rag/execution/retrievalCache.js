/**
 * @file retrievalCache.js
 * @description In-memory retrieval query cache.
 */

const CACHE = new Map();
const DEFAULT_TTL_MS = 60000; // 1 minute

export const retrievalCache = {
  get: (queryKey) => {
    const entry = CACHE.get(queryKey);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      CACHE.delete(queryKey);
      return null;
    }
    return entry.data;
  },

  set: (queryKey, data, ttlMs = DEFAULT_TTL_MS) => {
    CACHE.set(queryKey, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  },

  clear: () => CACHE.clear(),
};

export default retrievalCache;
