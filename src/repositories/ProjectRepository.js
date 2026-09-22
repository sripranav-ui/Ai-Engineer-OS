import logger from "../utils/logger.js";
import storageService from "../services/storageService.js";
import projectsData from "../data/projects.js";
import offlineSyncService from "../services/offlineSyncService.js";

/**
 * ProjectRepository implementation (Abstracting workspace projects with namespacing)
 */
export const ProjectRepository = {
  /**
   * Fetches active project configurations scoped by active user and workspace
   */
  getProjects: async (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[ProjectRepository] Retrieving project records for user "${activeUserId}" in workspace "${workspaceId}"...`);
    const raw = storageService.getInitialScopedData("pm_projects_registry", activeUserId, projectsData, workspaceId);
    return Array.isArray(raw) ? raw : projectsData;
  },

  /**
   * Persists project task checklists scoped by active user and workspace
   */
  saveProjects: async (projectsList, workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[ProjectRepository] Syncing project updates for user "${activeUserId}" in workspace "${workspaceId}"...`);
    const key = storageService.getScopedKey("pm_projects_registry", activeUserId, workspaceId);
    storageService.set(key, JSON.stringify(projectsList));
    
    if (!offlineSyncService.isOnline()) {
      offlineSyncService.addToQueue({
        type: "SAVE_PROJECTS",
        payload: { count: projectsList.length }
      }, workspaceId, activeUserId);
    }
    
    return projectsList;
  }
};

export default ProjectRepository;
