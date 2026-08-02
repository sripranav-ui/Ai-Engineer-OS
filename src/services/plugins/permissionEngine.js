// =======================================================
// permissionEngine.js — Plugin Permission Engine
// =======================================================
// Enforces fine-grained capability permissions for plugins:
//   - read:notes / write:notes
//   - read:projects / write:projects
//   - use:ai / use:notifications / use:storage
// =======================================================

import logger from "../../utils/logger.js";

export const PERMISSION_TYPES = {
  READ_NOTES:         "read:notes",
  WRITE_NOTES:        "write:notes",
  READ_PROJECTS:      "read:projects",
  WRITE_PROJECTS:     "write:projects",
  USE_AI:             "use:ai",
  USE_NOTIFICATIONS:  "use:notifications",
  USE_STORAGE:        "use:storage",
};

export const permissionEngine = {
  /** Check if a plugin possesses requested permission */
  hasPermission: (plugin, permission) => {
    if (!plugin || !Array.isArray(plugin.permissions)) return false;
    return plugin.permissions.includes(permission) || plugin.permissions.includes("*");
  },

  /** Enforce permission check, throwing error if ungranted */
  assertPermission: (plugin, permission) => {
    if (!permissionEngine.hasPermission(plugin, permission)) {
      logger.warn(`[PermissionEngine] Access Denied: Plugin "${plugin?.id || "unknown"}" requested "${permission}".`);
      throw new Error(`Permission Denied: Plugin missing required permission "${permission}".`);
    }
  },
};

export default permissionEngine;
