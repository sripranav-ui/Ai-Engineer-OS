import apiClient from "./apiClient";
import logger from "../utils/logger";

export const WorkspaceService = {
  fetchWorkspaces: async () => {
    logger.info("[WorkspaceService] Retrieving all workspaces configuration profiles...");
    return apiClient.get("/api/workspaces");
  },

  createWorkspace: async (workspaceObj) => {
    logger.info(`[WorkspaceService] Creating workspace: ${workspaceObj.name}`);
    return apiClient.post("/api/workspaces", JSON.stringify(workspaceObj));
  }
};

export default WorkspaceService;
