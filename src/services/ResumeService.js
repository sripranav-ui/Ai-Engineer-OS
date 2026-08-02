import apiClient from "./apiClient";
import logger from "../utils/logger";

export const ResumeService = {
  fetchResumeData: async () => {
    logger.info("[ResumeService] Retrieving user CV profile records...");
    return apiClient.get("/api/resume/me");
  },

  updateResumeLayout: async (resumeObj) => {
    logger.info("[ResumeService] Uploading modified resume schema configuration...");
    return apiClient.post("/api/resume/update", JSON.stringify(resumeObj));
  }
};

export default ResumeService;
