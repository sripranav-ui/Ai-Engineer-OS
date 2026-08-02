import logger from "../utils/logger";
import storageService from "../services/storageService";

/**
 * CertificateRepository implementation (Abstracting certificate count persistence with namespacing)
 */
export const CertificateRepository = {
  /**
   * Fetches user's certificate awards counts scoped by active workspace
   */
  getCertificatesCount: async (workspaceId = "default") => {
    logger.info(`[CertificateRepository] Checking certificates scoped by workspace "${workspaceId}"...`);
    return Number(storageService.get(`${workspaceId}_certificates`, "0"));
  },

  /**
   * Syncs new achievements unlocks scoped by active workspace
   */
  saveCertificatesCount: async (count, workspaceId = "default") => {
    logger.info(`[CertificateRepository] Updating certificate total to ${count} for workspace "${workspaceId}"`);
    storageService.set(`${workspaceId}_certificates`, count);
    return count;
  }
};

export default CertificateRepository;
