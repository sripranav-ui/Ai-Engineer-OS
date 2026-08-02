import apiClient from "./apiClient";
import logger from "../utils/logger";

export const AnalyticsService = {
  getTelemetryReports: async (period = "weekly") => {
    logger.info(`[AnalyticsService] Loading periodic report series: ${period}`);
    return apiClient.get(`/api/analytics?period=${period}`);
  },

  exportDataReport: async (format = "csv") => {
    logger.info(`[AnalyticsService] Exporting database report in format: ${format}`);
    // Simulate API download trigger
    return apiClient.get(`/api/analytics/export?format=${format}`);
  }
};

export default AnalyticsService;
