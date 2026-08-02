import apiClient from "./apiClient";
import logger from "../utils/logger";

export const ProjectService = {
  fetchProjects: async () => {
    logger.info("[ProjectService] Retrieving active workspace projects list...");
    return apiClient.get("/api/projects");
  },

  updateProjectTasks: async (projectsList) => {
    logger.info("[ProjectService] Persisting updated project sprint board tasks config...");
    return apiClient.post("/api/projects", JSON.stringify(projectsList));
  }
};

export default ProjectService;
