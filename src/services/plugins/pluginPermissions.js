/**
 * @file pluginPermissions.js
 * @description Permission scope validator enforcing capability checks for plugins.
 */

export const PLUGIN_PERMISSIONS = {
  FILESYSTEM_READ:   "filesystem.read",
  FILESYSTEM_WRITE:  "filesystem.write",
  NETWORK:           "network",
  MEMORY_READ:       "memory.read",
  MEMORY_WRITE:      "memory.write",
  WORKFLOW_EXECUTE:  "workflow.execute",
  AGENT_SPAWN:       "agent.spawn",
  TOOL_EXECUTE:      "tool.execute",
  NOTIFICATIONS_SEND:"notifications.send",
};

export const pluginPermissions = {
  /**
   * Validates if a plugin holds a required permission scope.
   * @param {Object} pluginManifest
   * @param {string} requiredPermission
   * @returns {boolean}
   */
  hasPermission: (pluginManifest, requiredPermission) => {
    if (!pluginManifest || !Array.isArray(pluginManifest.permissions)) {
      return false;
    }
    return pluginManifest.permissions.includes(requiredPermission) || pluginManifest.permissions.includes("*");
  },

  /**
   * Asserts permission scope, throwing error if unauthorized.
   * @param {Object} pluginManifest
   * @param {string} requiredPermission
   */
  assertPermission: (pluginManifest, requiredPermission) => {
    if (!pluginPermissions.hasPermission(pluginManifest, requiredPermission)) {
      throw new Error(`Permission Denied: Plugin "${pluginManifest.id}" lacks required permission "${requiredPermission}".`);
    }
  },
};

export default pluginPermissions;
