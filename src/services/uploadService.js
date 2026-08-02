import logger from "../utils/logger";

/**
 * File Storage and Multipart Form-Data Upload Service
 */
export const uploadService = {
  /**
   * Upload target files
   */
  upload: async (file, onProgress) => {
    logger.info(`[UploadService] Initiating upload for "${file.name}" (${file.size} bytes)`);

    return new Promise((resolve) => {
      let percent = 0;
      const interval = setInterval(() => {
        percent += 20;
        if (onProgress) onProgress(percent);
        logger.info(`[UploadService] Upload progress: ${percent}%`);

        if (percent >= 100) {
          clearInterval(interval);
          const mockUrl = `/uploads/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
          logger.info(`[UploadService] Upload completed. File URL: ${mockUrl}`);
          resolve({
            success: true,
            url: mockUrl,
            name: file.name,
          });
        }
      }, 200);
    });
  }
};

export default uploadService;
