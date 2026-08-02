/**
 * Simulated Token Counter Utility (Approximates based on character metrics)
 */
export const tokenCounter = {
  /**
   * Approximates token count for string inputs (standard baseline: 4 chars ~ 1 token)
   */
  count: (text) => {
    if (!text) return 0;
    return Math.max(1, Math.round(text.length / 4));
  }
};

export default tokenCounter;
