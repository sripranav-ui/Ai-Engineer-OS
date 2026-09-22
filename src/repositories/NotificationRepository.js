import logger from "../utils/logger.js";
import storageService from "../services/storageService.js";

/**
 * NotificationRepository implementation (Abstracting system notifications logs with namespacing)
 */
export const NotificationRepository = {
  /**
   * Retrieves active unread notification items scoped by active user and workspace
   */
  getNotificationsList: async (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[NotificationRepository] Reading notice collection for user "${activeUserId}" in workspace "${workspaceId}"...`);
    const raw = storageService.getInitialScopedData("notifications", activeUserId, [], workspaceId);
    return Array.isArray(raw) ? raw : [];
  },

  /**
   * Syncs notice lists scoped by active user and workspace
   */
  saveNotificationsList: async (list, workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[NotificationRepository] Updating notice logs for user "${activeUserId}" in workspace "${workspaceId}"...`);
    const key = storageService.getScopedKey("notifications", activeUserId, workspaceId);
    storageService.set(key, JSON.stringify(list));
    return list;
  }
};

export default NotificationRepository;
