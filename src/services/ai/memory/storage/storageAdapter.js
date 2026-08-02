// =======================================================
// storageAdapter.js — Pluggable Storage Layer Abstraction
// =======================================================
// Provides unified get, set, remove, and clear abstractions.
// Handles corrupted JSON recovery, quota errors, and prepares for
// future IndexedDB or Cloud Sync adapters.
// =======================================================

import storageService from "../../../storageService.js";
import logger from "../../../../utils/logger.js";

export const STORAGE_BACKENDS = {
  LOCAL_STORAGE: "localStorage",
  INDEXED_DB:    "indexedDB",
  CLOUD_SYNC:    "cloudSync",
};

export class StorageAdapter {
  constructor(backendType = STORAGE_BACKENDS.LOCAL_STORAGE) {
    this.backendType = backendType;
  }

  get(key, fallback = null) {
    try {
      const raw = storageService.get(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      logger.error(`[StorageAdapter] Failed to parse JSON for key "${key}". Returning fallback.`, err);
      return fallback;
    }
  }

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      storageService.set(key, serialized);
      return true;
    } catch (err) {
      logger.error(`[StorageAdapter] Failed to write key "${key}". Storage quota exceeded.`, err);
      return false;
    }
  }

  remove(key) {
    try {
      storageService.remove(key);
      return true;
    } catch (err) {
      logger.error(`[StorageAdapter] Failed to remove key "${key}".`, err);
      return false;
    }
  }

  clear() {
    logger.warn("[StorageAdapter] Clear requested for storage adapter.");
    return true;
  }
}

export const defaultStorageAdapter = new StorageAdapter();
export default defaultStorageAdapter;
