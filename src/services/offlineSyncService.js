import logger from "../utils/logger";
import storageService from "../services/storageService";

/**
 * Offline Sync Service Strategy
 * Abstracts sync queues, mock conflicts, network online/offline listeners, and automatic sync triggers
 */
export const offlineSyncService = {
  /**
   * Checks if network is active (supports simulation mode overrides)
   */
  isOnline: () => {
    const override = storageService.get("offline_simulated_mode");
    if (override === "true") return false;
    return navigator.onLine;
  },

  /**
   * Sets simulated offline mode status
   */
  setSimulatedOffline: (status) => {
    storageService.set("offline_simulated_mode", String(status));
    logger.info(`[OfflineSyncService] Simulated Offline status: ${status}`);
    // Trigger custom events to notify components
    window.dispatchEvent(new Event("offline_status_change"));
  },

  /**
   * Retrieves pending sync queue list scoped by active workspace
   */
  getSyncQueue: (workspaceId = "default") => {
    const raw = storageService.get(`${workspaceId}_sync_queue`);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Appends action to sync queue
   */
  addToQueue: (action, workspaceId = "default") => {
    const queue = offlineSyncService.getSyncQueue(workspaceId);
    const item = {
      id: Date.now(),
      actionType: action.type, // e.g. "UPDATE_NOTE", "COMPLETE_LESSON"
      payload: action.payload,
      timestamp: new Date().toISOString()
    };
    queue.push(item);
    storageService.set(`${workspaceId}_sync_queue`, JSON.stringify(queue));
    logger.info("[OfflineSyncService] Appended action item to sync queue:", item);
    window.dispatchEvent(new Event("sync_queue_update"));
  },

  /**
   * Clears queue items
   */
  clearQueue: (workspaceId = "default") => {
    storageService.remove(`${workspaceId}_sync_queue`);
    window.dispatchEvent(new Event("sync_queue_update"));
  },

  /**
   * Resolves conflicts
   */
  getConflicts: (workspaceId = "default") => {
    const raw = storageService.get(`${workspaceId}_sync_conflicts`);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Creates a mock conflict for testing conflict resolution UI
   */
  triggerMockConflict: (workspaceId = "default") => {
    const conflicts = [
      {
        id: "conflict_1",
        title: "Notes Conflict: Dijkstra Algorithm",
        fieldName: "Notes Content",
        localValue: "Edited notes content locally on Day 7, focusing on optimization techniques.",
        serverValue: "Edited notes content on cloud server, focusing on graph representation constraints.",
        timestamp: new Date().toISOString()
      }
    ];
    storageService.set(`${workspaceId}_sync_conflicts`, JSON.stringify(conflicts));
    window.dispatchEvent(new Event("sync_conflicts_update"));
    logger.info("[OfflineSyncService] Triggered mock sync conflict.");
  },

  /**
   * Resolves a conflict choice
   */
  resolveConflict: (conflictId, choice, workspaceId = "default") => {
    logger.info(`[OfflineSyncService] Resolving conflict ${conflictId} using choice "${choice}"...`);
    const conflicts = offlineSyncService.getConflicts(workspaceId);
    const nextConflicts = conflicts.filter(c => c.id !== conflictId);
    storageService.set(`${workspaceId}_sync_conflicts`, JSON.stringify(nextConflicts));
    
    // Set last synced timestamp
    storageService.set(`${workspaceId}_last_synced_time`, new Date().toISOString());
    window.dispatchEvent(new Event("sync_conflicts_update"));
  },

  /**
   * Fetches last synced timestamp
   */
  getLastSyncedTime: (workspaceId = "default") => {
    return storageService.get(`${workspaceId}_last_synced_time`) || "Never";
  }
};

export default offlineSyncService;
