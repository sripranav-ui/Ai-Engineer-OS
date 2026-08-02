import logger from "../utils/logger";
import storageService from "../services/storageService";
import offlineSyncService from "../services/offlineSyncService";

/**
 * PlannerRepository implementation (Abstracting planner schedule items with namespacing)
 */
export const PlannerRepository = {
  /**
   * Retrieves daily task list schedules scoped by active workspace
   */
  getScheduleList: async (workspaceId = "default") => {
    logger.info(`[PlannerRepository] Reading planner tasks for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_planner_schedules`);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Syncs custom calendar events scoped by active workspace
   */
  saveScheduleList: async (list, workspaceId = "default") => {
    logger.info(`[PlannerRepository] Syncing planner for workspace "${workspaceId}"...`);
    storageService.set(`${workspaceId}_planner_schedules`, JSON.stringify(list));
    
    if (!offlineSyncService.isOnline()) {
      offlineSyncService.addToQueue({
        type: "SAVE_PLANNER",
        payload: { count: list.length }
      }, workspaceId);
    }
    
    return list;
  }
};

export default PlannerRepository;
