// =======================================================
// pluginStorage.js — Isolated Plugin Storage Engine
// =======================================================
// Provides isolated key-value storage scoped per plugin ID
// to prevent cross-plugin data leakage or collision.
// =======================================================

import storageService from "../storageService.js";

export const createPluginStorage = (pluginId) => {
  const getPrefixKey = (key) => `plugin_store_${pluginId}_${key}`;

  return {
    get: (key, fallback = null) => {
      try {
        const val = storageService.get(getPrefixKey(key));
        return val !== null ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    },

    set: (key, value) => {
      try {
        storageService.set(getPrefixKey(key), JSON.stringify(value));
      } catch (e) {
        // Storage write fail
      }
    },

    remove: (key) => {
      storageService.remove(getPrefixKey(key));
    },
  };
};

export const pluginStorage = {
  getItem: (key, workspaceId = "default") => {
    const raw = storageService.get(`plugin_${workspaceId}_${key}`);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  setItem: (key, val, workspaceId = "default") => {
    storageService.set(`plugin_${workspaceId}_${key}`, JSON.stringify(val));
  },
};

export default createPluginStorage;
