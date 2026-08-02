import apiClient from "./apiClient";
import logger from "../utils/logger";

export const NotificationService = {
  getNotifications: async () => {
    logger.info("[NotificationService] Fetching notification records...");
    return apiClient.get("/api/notifications");
  },

  markAsRead: async (id) => {
    logger.info(`[NotificationService] Marking notification ${id} as read...`);
    return apiClient.post(`/api/notifications/${id}/read`);
  },

  clearAll: async () => {
    logger.info("[NotificationService] Archive all active warnings notifications...");
    return apiClient.delete("/api/notifications");
  }
};

export default NotificationService;
