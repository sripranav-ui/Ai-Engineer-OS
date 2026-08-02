import logger from "../utils/logger";
import storageService from "../services/storageService";
import projectsData from "../data/projects";
import offlineSyncService from "../services/offlineSyncService";

/**
 * ProjectRepository implementation (Abstracting workspace projects with namespacing)
 */
export const ProjectRepository = {
  /**
   * Fetches active project configurations scoped by active workspace
   */
  getProjects: async (workspaceId = "default") => {
    logger.info(`[ProjectRepository] Retrieving project records for workspace "${workspaceId}"...`);
    const raw = storageService.get(`${workspaceId}_projects`);
    return raw ? JSON.parse(raw) : projectsData;
  },

  /**
   * Persists project task checklists scoped by active workspace
   */
  saveProjects: async (projectsList, workspaceId = "default") => {
    logger.info(`[ProjectRepository] Syncing project updates for workspace "${workspaceId}"...`);
    storageService.set(`${workspaceId}_projects`, JSON.stringify(projectsList));
    
    if (!offlineSyncService.isOnline()) {
      offlineSyncService.addToQueue({
        type: "SAVE_PROJECTS",
        payload: { count: projectsList.length }
      }, workspaceId);
    }
    
    return projectsList;
  }
};

export default ProjectRepository;
