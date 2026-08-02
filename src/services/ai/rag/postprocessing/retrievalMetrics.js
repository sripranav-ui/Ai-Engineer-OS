/**
 * @file retrievalMetrics.js
 * @description Telemetry metrics tracker for retrieval latency, cache hits, and source counts.
 */

const METRICS = {
  totalQueries: 0,
  cacheHits: 0,
  cacheMisses: 0,
  totalLatencyMs: 0,
};

export const retrievalMetrics = {
  recordQuery: (cacheHit, latencyMs) => {
    METRICS.totalQueries++;
    if (cacheHit) METRICS.cacheHits++;
    else METRICS.cacheMisses++;
    METRICS.totalLatencyMs += latencyMs;
  },

  getMetrics: () => ({
    ...METRICS,
    cacheHitRate: METRICS.totalQueries > 0 ? Math.round((METRICS.cacheHits / METRICS.totalQueries) * 100) : 0,
  }),
};

export default retrievalMetrics;
