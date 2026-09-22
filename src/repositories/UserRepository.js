import logger from "../utils/logger.js";
import storageService from "../services/storageService.js";

/**
 * UserRepository strategies implementation (Abstracting local persistence with namespacing)
 */
export const UserRepository = {
  /**
   * Fetches profile data details scoped by active user
   */
  getProfile: async (workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[UserRepository] Retrieving user profile for user "${activeUserId}"...`);
    return {
      name: storageService.getInitialScopedData("profileName", activeUserId, "Pranav"),
      bio: storageService.getInitialScopedData("profileBio", activeUserId, "AI Engineering student"),
      xp: Number(storageService.getInitialScopedData("xp", activeUserId, 120)) || 120,
      streak: Number(storageService.getInitialScopedData("streak", activeUserId, 3)) || 3,
    };
  },

  /**
   * Saves profile bio adjustments scoped by active user
   */
  saveProfile: async (profile, workspaceId = "default", userId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    logger.info(`[UserRepository] Persisting updates for user "${activeUserId}"...`, profile);
    if (profile.name) storageService.set(storageService.getUserKey("profileName", activeUserId), profile.name);
    if (profile.bio) storageService.set(storageService.getUserKey("profileBio", activeUserId), profile.bio);
    if (profile.xp !== undefined) storageService.set(storageService.getUserKey("xp", activeUserId), profile.xp);
    if (profile.streak !== undefined) storageService.set(storageService.getUserKey("streak", activeUserId), profile.streak);
    return profile;
  }
};

export default UserRepository;
