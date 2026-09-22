import logger from "../utils/logger.js";

// Standard fallback memory storage
const memoryStorage = {};

/**
 * Safe Browser Persistence Services
 */
export const storageService = {
  /**
   * Safe set item to localStorage with Memory Storage Fallback
   */
  set: (key, value) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    } catch (err) {
      logger.warn(`[StorageService] Failed to write to localStorage for key: ${key}. Falling back to memory storage.`, err);
      memoryStorage[key] = value;
    }
  },

  /**
   * Safe get item from localStorage with Memory Storage Fallback
   */
  get: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item !== null ? item : memoryStorage[key] || null;
      }
      return memoryStorage[key] || null;
    } catch (err) {
      logger.warn(`[StorageService] Failed to read from localStorage for key: ${key}. Returning memory fallback.`, err);
      return memoryStorage[key] || null;
    }
  },

  /**
   * Safe remove item from localStorage
   */
  remove: (key) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch (err) {
      logger.warn(`[StorageService] Failed to remove item from localStorage for key: ${key}.`, err);
      delete memoryStorage[key];
    }
  },

  /**
   * Reads current authenticated user ID from session or falls back to 'guest'
   */
  getCurrentUserId: () => {
    try {
      const sessionRaw = storageService.get("auth_session");
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed && parsed.id) return parsed.id;
      }
    } catch (err) {
      logger.warn("[StorageService] Failed to parse auth_session for user ID.", err);
    }
    return "guest";
  },

  /**
   * Constructs a user-scoped storage key: `${userId}_${domainKey}`
   */
  getUserKey: (domainKey, userId) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    return `${activeUserId}_${domainKey}`;
  },

  /**
   * Constructs a user + workspace-scoped storage key: `${userId}_${workspaceId}_${domainKey}`
   */
  getScopedKey: (domainKey, userId, workspaceId = "default") => {
    const activeUserId = userId || storageService.getCurrentUserId();
    return `${activeUserId}_${workspaceId}_${domainKey}`;
  },

  /**
   * Verifies whether raw unscoped legacy data matches known application seed/demo signatures
   */
  isVerifiableSeedData: (domainKey, parsedData) => {
    if (!parsedData) return false;
    if (domainKey === "notes_data_list" && Array.isArray(parsedData)) {
      return parsedData.every((item) => item && (item.id === 1 || item.id === 2));
    }
    if (domainKey === "knowledge_flashcards" && Array.isArray(parsedData)) {
      return parsedData.every((item) => item && item.id >= 1 && item.id <= 3);
    }
    if (domainKey === "knowledge_summaries" && Array.isArray(parsedData)) {
      return parsedData.every((item) => item && (item.id === 1 || item.id === 2));
    }
    if (domainKey === "notes_folders_list" && Array.isArray(parsedData)) {
      const knownFolders = ["General", "AI Engineering", "Job Prep"];
      return parsedData.every((f) => knownFolders.includes(f));
    }
    return false;
  },

  /**
   * Reads user-scoped data with fallback to seed data and provenance-safe legacy migration
   */
  getInitialScopedData: (domainKey, userId, seedData, workspaceId = null) => {
    const activeUserId = userId || storageService.getCurrentUserId();
    const scopedKey = workspaceId
      ? storageService.getScopedKey(domainKey, activeUserId, workspaceId)
      : storageService.getUserKey(domainKey, activeUserId);

    const savedScoped = storageService.get(scopedKey);
    if (savedScoped !== null && savedScoped !== undefined) {
      try {
        const parsed = JSON.parse(savedScoped);
        if (Array.isArray(parsed) ? parsed.length >= 0 : parsed !== null) {
          return parsed;
        }
      } catch {
        return savedScoped;
      }
    }

    // Provenance-Safe Migration: Only migrate if unscoped data matches verifiable seed/demo signatures
    const legacyKey = workspaceId ? `${workspaceId}_${domainKey}` : domainKey;
    const legacyRaw = storageService.get(legacyKey);
    if (legacyRaw !== null && legacyRaw !== undefined) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        if (storageService.isVerifiableSeedData(domainKey, legacyParsed)) {
          storageService.set(scopedKey, legacyRaw);
          logger.info(`[StorageService] Migrated verified seed data for key "${legacyKey}" to "${scopedKey}".`);
          return legacyParsed;
        }
      } catch {
        // Do not migrate unparsed or arbitrary legacy data
      }
    }

    return seedData;
  }
};

export default storageService;

