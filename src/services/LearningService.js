import apiClient from "./apiClient";
import logger from "../utils/logger";

export const LearningService = {
  getAIRecommendations: async () => {
    logger.info("[LearningService] Loading adaptive weakness diagnostics recommendations...");
    return apiClient.get("/api/lessons");
  }
};

export default LearningService;
