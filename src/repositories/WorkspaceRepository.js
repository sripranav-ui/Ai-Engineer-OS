import logger from "../utils/logger";
import storageService from "../services/storageService";

export const WorkspaceRepository = {
  getWorkspaces: async () => {
    logger.info("[WorkspaceRepository] Retrieving active workspaces index...");
    const raw = storageService.get("workspaces_list");
    return raw ? JSON.parse(raw) : [];
  },

  saveWorkspaces: async (workspacesList) => {
    logger.info("[WorkspaceRepository] Persisting workspaces index state...");
    storageService.set("workspaces_list", JSON.stringify(workspacesList));
    return workspacesList;
  }
};

export default WorkspaceRepository;
