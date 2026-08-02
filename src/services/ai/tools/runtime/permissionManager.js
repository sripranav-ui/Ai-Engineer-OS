// =======================================================
// permissionManager.js — Capability & Permission Validator
// =======================================================

import logger from "../../../../utils/logger.js";

export const PERMISSION_SCOPES = {
  READ_PROJECTS:  "READ_PROJECTS",
  WRITE_PROJECTS: "WRITE_PROJECTS",
  DELETE_PROJECTS:"DELETE_PROJECTS",
  READ_NOTES:     "READ_NOTES",
  WRITE_NOTES:    "WRITE_NOTES",
  READ_KNOWLEDGE: "READ_KNOWLEDGE",
  WRITE_KNOWLEDGE:"WRITE_KNOWLEDGE",
  EXECUTE_COMMAND:"EXECUTE_COMMAND",
};

export const permissionManager = {
  /**
   * Check if execution context satisfies tool permissions
   * @param {Object} tool
   * @param {Object} executionContext
   * @returns {{ allowed: boolean, reason?: string }}
   */
  validatePermissions: (tool, executionContext) => {
    if (!tool.requiredPermissions || tool.requiredPermissions.length === 0) {
      return { allowed: true };
    }

    const userPermissions = executionContext.permissions || ["*"];

    // Admin wildcard
    if (userPermissions.includes("*")) {
      return { allowed: true };
    }

    for (const scope of tool.requiredPermissions) {
      if (!userPermissions.includes(scope)) {
        logger.warn(`[PermissionManager] Denied tool "${tool.id}". Missing scope: "${scope}"`);
        return {
          allowed: false,
          reason: `Missing required permission scope: ${scope}`,
        };
      }
    }

    return { allowed: true };
  },
};

export default permissionManager;
