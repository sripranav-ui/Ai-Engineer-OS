import apiClient from "./apiClient";
import logger from "../utils/logger";

export const CareerService = {
  fetchCoachInsights: async () => {
    logger.info("[CareerService] Fetching career diagnostics matrix metrics...");
    return apiClient.get("/api/career/coach");
  },

  submitSTARInterviewResponse: async (questionId, responseText) => {
    logger.info(`[CareerService] Submitting interview answer evaluation for question: ${questionId}`);
    return apiClient.post("/api/career/interview/submit", JSON.stringify({ questionId, responseText }));
  }
};

export default CareerService;
