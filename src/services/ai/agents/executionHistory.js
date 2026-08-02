/**
 * @file executionHistory.js
 * @description Persistent multi-agent execution audit log store.
 */

import storageService from "../../storageService.js";

const HISTORY_KEY = "multi_agent_execution_history";

export const executionHistory = {
  /**
   * Persists multi-agent goal execution record.
   * @param {Object} record
   */
  recordExecution: (record) => {
    const raw = storageService.get(HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({ ...record, timestamp: new Date().toISOString() });
    if (history.length > 50) history.pop();
    storageService.set(HISTORY_KEY, JSON.stringify(history));
  },

  getHistory: () => {
    const raw = storageService.get(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  },
};

export default executionHistory;
