// =======================================================
// extensionSDK.js — Public Plugin Developer SDK
// =======================================================
// Stable API surface provided to third-party plugins.
// Encapsulates core services behind permission checks.
// =======================================================

import { permissionEngine, PERMISSION_TYPES } from "./permissionEngine";
import { createPluginStorage } from "./pluginStorage";
import eventBus from "./eventBus";
import commandRegistry from "./commandRegistry";
import aiEngine from "../ai/aiEngine";
import storageService from "../storageService";

export function createExtensionSDK(plugin) {
  const storage = createPluginStorage(plugin.id);

  return {
    pluginInfo: {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
    },

    // ─── Storage Namespace ────────────────────────────────────
    storage,

    // ─── Event Bus Namespace ──────────────────────────────────
    events: {
      subscribe: (eventName, callback) => eventBus.subscribe(eventName, callback),
      publish: (eventName, payload) => eventBus.publish(eventName, payload),
    },

    // ─── Commands Namespace ───────────────────────────────────
    commands: {
      register: (id, label, handler, shortcut) => {
        commandRegistry.registerCommand({
          id: `${plugin.id}:${id}`,
          label: `[${plugin.name}] ${label}`,
          handler,
          shortcut,
          pluginId: plugin.id,
        });
      },
    },

    // ─── AI Engine Namespace ──────────────────────────────────
    ai: {
      ask: async (prompt, roleId = "coder") => {
        permissionEngine.assertPermission(plugin, PERMISSION_TYPES.USE_AI);
        return await aiEngine.sendMessage({ userQuery: prompt, roleId });
      },
    },

    // ─── Notes Namespace ──────────────────────────────────────
    notes: {
      getNotes: () => {
        permissionEngine.assertPermission(plugin, PERMISSION_TYPES.READ_NOTES);
        const raw = storageService.get("knowledge_notes");
        return raw ? JSON.parse(raw) : [];
      },
    },

    // ─── Projects Namespace ───────────────────────────────────
    projects: {
      getProjects: () => {
        permissionEngine.assertPermission(plugin, PERMISSION_TYPES.READ_PROJECTS);
        const raw = storageService.get("pm_projects_registry");
        return raw ? JSON.parse(raw) : [];
      },
    },
  };
}

export default createExtensionSDK;
