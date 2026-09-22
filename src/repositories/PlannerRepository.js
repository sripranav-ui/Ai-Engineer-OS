import logger from "../utils/logger.js";
import storageService from "../services/storageService.js";
import offlineSyncService from "../services/offlineSyncService.js";

/**
 * PlannerRepository implementation (Abstracting planner schedule items with namespacing)
 */
export const PlannerRepository = {
  /**
   * Retrieves daily task list schedules scoped by active user and workspace
   */
  getScheduleList: async (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[PlannerRepository] Reading planner tasks for user "${activeUserId}" in workspace "${workspaceId}"...`);
    const raw = storageService.getInitialScopedData("planner_schedules", activeUserId, [], workspaceId);
    return Array.isArray(raw) ? raw : [];
  },

  /**
   * Syncs custom calendar events scoped by active user and workspace
   */
  saveScheduleList: async (list, workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[PlannerRepository] Syncing planner for user "${activeUserId}" in workspace "${workspaceId}"...`);
    const key = storageService.getScopedKey("planner_schedules", activeUserId, workspaceId);
    storageService.set(key, JSON.stringify(list));
    
    if (!offlineSyncService.isOnline()) {
      offlineSyncService.addToQueue({
        type: "SAVE_PLANNER",
        payload: { count: list.length }
      }, workspaceId, activeUserId);
    }
    
    return list;
  }
};

export default PlannerRepository;
