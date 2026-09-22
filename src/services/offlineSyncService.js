import logger from "../utils/logger.js";
import storageService from "../services/storageService.js";

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
   * Retrieves pending sync queue list scoped by active user and workspace
   */
  getSyncQueue: (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    const key = storageService.getScopedKey("sync_queue", activeUserId, workspaceId);
    const raw = storageService.get(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Filter strictly: ignore items without userId or belonging to another user
      return parsed.filter(item => item && item.userId === activeUserId && item.workspaceId === workspaceId);
    } catch {
      return [];
    }
  },

  /**
   * Appends action to user + workspace scoped sync queue
   */
  addToQueue: (action, workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    const queue = offlineSyncService.getSyncQueue(workspaceId, activeUserId);
    const item = {
      id: Date.now(),
      userId: activeUserId,
      workspaceId,
      actionType: action.type, // e.g. "UPDATE_NOTE", "COMPLETE_LESSON"
      payload: action.payload,
      timestamp: new Date().toISOString()
    };
    queue.push(item);
    const key = storageService.getScopedKey("sync_queue", activeUserId, workspaceId);
    storageService.set(key, JSON.stringify(queue));
    logger.info("[OfflineSyncService] Appended action item to user-scoped sync queue:", item);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("sync_queue_update"));
    }
  },

  /**
   * Clears queue items for user + workspace
   */
  clearQueue: (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    const key = storageService.getScopedKey("sync_queue", activeUserId, workspaceId);
    storageService.remove(key);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("sync_queue_update"));
    }
  },

  /**
   * Resolves conflicts scoped by user + workspace
   */
  getConflicts: (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    const key = storageService.getScopedKey("sync_conflicts", activeUserId, workspaceId);
    const raw = storageService.get(key);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Creates a mock conflict for testing conflict resolution UI
   */
  triggerMockConflict: (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
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
    const key = storageService.getScopedKey("sync_conflicts", activeUserId, workspaceId);
    storageService.set(key, JSON.stringify(conflicts));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("sync_conflicts_update"));
    }
    logger.info("[OfflineSyncService] Triggered mock sync conflict.");
  },

  /**
   * Resolves a conflict choice
   */
  resolveConflict: (conflictId, choice, workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[OfflineSyncService] Resolving conflict ${conflictId} using choice "${choice}"...`);
    const conflicts = offlineSyncService.getConflicts(workspaceId, activeUserId);
    const nextConflicts = conflicts.filter(c => c.id !== conflictId);
    const key = storageService.getScopedKey("sync_conflicts", activeUserId, workspaceId);
    storageService.set(key, JSON.stringify(nextConflicts));
    
    // Set last synced timestamp
    offlineSyncService.setLastSyncedTime(new Date().toLocaleTimeString(), workspaceId, activeUserId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("sync_conflicts_update"));
    }
  },

  /**
   * Sets last synced timestamp
   */
  setLastSyncedTime: (timeString, workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    const key = storageService.getScopedKey("last_synced_time", activeUserId, workspaceId);
    storageService.set(key, timeString || new Date().toLocaleTimeString());
  },

  /**
   * Fetches last synced timestamp
   */
  getLastSyncedTime: (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    const key = storageService.getScopedKey("last_synced_time", activeUserId, workspaceId);
    return storageService.get(key) || "Never";
  }
};

export default offlineSyncService;
