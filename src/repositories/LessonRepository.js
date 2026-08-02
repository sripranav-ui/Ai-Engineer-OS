import logger from "../utils/logger";
import roadmapData from "../data/roadmap";
import storageService from "../services/storageService";

/**
 * LessonRepository implementation (Abstracting academy curriculum content & learning engine analytics)
 */
export const LessonRepository = {
  /**
   * Retrieves curriculum checkpoints
   */
  getLessonsList: async () => {
    logger.info("[LessonRepository] Fetching curriculum academy stages...");
    return roadmapData;
  },

  /**
   * Retrieves personalized course/project/certificate recommendations
   */
  getRecommendations: async (workspaceId = "default") => {
    logger.info(`[LessonRepository] Fetching AI personalized recommendations for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_personalized_recommendations`);
    return raw ? JSON.parse(raw) : {
      course: { id: "nlp_llms", title: "Natural Language Processing & LLMs" },
      project: { id: "vector_search", title: "Custom Vector Search Engine" },
      certificate: { id: "nlp_expert", title: "Advanced NLP Specialist" }
    };
  },

  /**
   * Performs weakness diagnostics & revision recommenders
   */
  getWeakTopics: async (workspaceId = "default") => {
    logger.info(`[LessonRepository] Performing AI difficulty & weak topic diagnostics for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_weak_topics`);
    return raw ? JSON.parse(raw) : [
      { name: "Multi-Head Attention Matrices", accuracy: "40%", reason: "Failed Quiz last attempt" },
      { name: "Window Functions partitioning", accuracy: "55%", reason: "Time exceeded during exercises" }
    ];
  },

  /**
   * Estimates completion target dates
   */
  getCompletionPrediction: async (workspaceId = "default") => {
    logger.info(`[LessonRepository] Calculating completion estimate parameters for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_completion_prediction`);
    return raw ? JSON.parse(raw) : {
      estimatedCompletionDate: "2026-09-12",
      studyVelocityDays: 45
    };
  },

  /**
   * Retrieves planned study calendar events
   */
  getLearningCalendar: async (workspaceId = "default") => {
    logger.info(`[LessonRepository] Fetching study block calendar for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_learning_calendar`);
    return raw ? JSON.parse(raw) : [];
  }
};

export default LessonRepository;
