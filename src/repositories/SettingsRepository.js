import logger from "../utils/logger";
import storageService from "../services/storageService";

export const SettingsRepository = {
  getSettings: async (workspaceId = "default") => {
    logger.info(`[SettingsRepository] Loading application config profiles for workspace: ${workspaceId}`);
    const raw = storageService.get(`${workspaceId}_app_settings`);
    return raw ? JSON.parse(raw) : {};
  },

  saveSettings: async (settingsObj, workspaceId = "default") => {
    logger.info(`[SettingsRepository] Saving application config profiles for workspace: ${workspaceId}`);
    storageService.set(`${workspaceId}_app_settings`, JSON.stringify(settingsObj));
    return settingsObj;
  }
};

export default SettingsRepository;
