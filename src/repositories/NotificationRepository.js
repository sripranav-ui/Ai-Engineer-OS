import logger from "../utils/logger";
import storageService from "../services/storageService";

/**
 * NotificationRepository implementation (Abstracting system notifications logs with namespacing)
 */
export const NotificationRepository = {
  /**
   * Retrieves active unread notification items scoped by active workspace
   */
  getNotificationsList: async (workspaceId = "default") => {
    logger.info(`[NotificationRepository] Reading notice collection for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_notifications`);
    return raw ? JSON.parse(raw) : [];
  },

  /**
   * Syncs notice lists scoped by active workspace
   */
  saveNotificationsList: async (list, workspaceId = "default") => {
    logger.info(`[NotificationRepository] Updating notice logs for workspace "${workspaceId}"...`);
    storageService.set(`${workspaceId}_notifications`, JSON.stringify(list));
    return list;
  }
};

export default NotificationRepository;
