import logger from "../utils/logger";
import storageService from "../services/storageService";

export const RoadmapRepository = {
  getRoadmap: async (workspaceId = "default") => {
    logger.info(`[RoadmapRepository] Reading roadmap checkpoints for workspace: ${workspaceId}`);
    const raw = storageService.get(`${workspaceId}_roadmap_data`);
    return raw ? JSON.parse(raw) : null;
  },

  saveRoadmap: async (roadmapData, workspaceId = "default") => {
    logger.info(`[RoadmapRepository] Saving roadmap checkpoints for workspace: ${workspaceId}`);
    storageService.set(`${workspaceId}_roadmap_data`, JSON.stringify(roadmapData));
    return roadmapData;
  }
};

export default RoadmapRepository;
