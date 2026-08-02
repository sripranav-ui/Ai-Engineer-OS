import logger from "../utils/logger";
import storageService from "../services/storageService";

/**
 * UserRepository strategies implementation (Abstracting local persistence with namespacing)
 */
export const UserRepository = {
  /**
   * Fetches profile data details scoped by active workspace
   */
  getProfile: async (workspaceId = "default") => {
    logger.info(`[UserRepository] Retrieving user profile for workspace "${workspaceId}"...`);
    return {
      name: storageService.get(`${workspaceId}_profileName`, "Pranav"),
      bio: storageService.get(`${workspaceId}_profileBio`, "AI Engineering student"),
      xp: Number(storageService.get(`${workspaceId}_xp`, "120")),
      streak: Number(storageService.get(`${workspaceId}_streak`, "3")),
    };
  },

  /**
   * Saves profile bio adjustments scoped by active workspace
   */
  saveProfile: async (profile, workspaceId = "default") => {
    logger.info(`[UserRepository] Persisting updates for workspace "${workspaceId}"...`, profile);
    if (profile.name) storageService.set(`${workspaceId}_profileName`, profile.name);
    if (profile.bio) storageService.set(`${workspaceId}_profileBio`, profile.bio);
    if (profile.xp !== undefined) storageService.set(`${workspaceId}_xp`, profile.xp);
    if (profile.streak !== undefined) storageService.set(`${workspaceId}_streak`, profile.streak);
    return profile;
  }
};

export default UserRepository;
