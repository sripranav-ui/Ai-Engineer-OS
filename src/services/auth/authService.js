/**
 * @file authService.js
 * @description Minimal User Identity Normalization & Development Identity Resolution.
 * Strictly decoupled from password storage or credential verification.
 */

import { ROLES, normalizeRole } from "./roleDefinitions.js";
import { getPermissionsForRole } from "./rolePermissionMap.js";

/**
 * Format and normalize user object identity
 * @param {Object} rawUser
 * @returns {Object} Normalized user
 */
export function normalizeUserIdentity(rawUser = {}) {
  if (!rawUser || typeof rawUser !== "object") {
    return null;
  }

  const role = normalizeRole(rawUser.role);
  const permissions = Array.isArray(rawUser.permissions) && rawUser.permissions.length > 0
    ? rawUser.permissions
    : getPermissionsForRole(role);

  return {
    id: rawUser.id || rawUser.email || `usr_${Date.now()}`,
    name: rawUser.name || "Development Identity",
    email: rawUser.email || "dev@example.com",
    role,
    permissions,
    profile: {
      bio: rawUser.bio || rawUser.profile?.bio || "",
      avatarUrl: rawUser.avatarUrl || rawUser.profile?.avatarUrl || "",
      joinedDate: rawUser.joinedDate || rawUser.profile?.joinedDate || "July 2026",
    },
    preferences: {
      theme: rawUser.theme || rawUser.preferences?.theme || "dark",
      accentName: rawUser.accentName || rawUser.preferences?.accentName || "Obsidian",
    },
  };
}

/**
 * Default development identities
 */
export const DEV_IDENTITIES = {
  USER: normalizeUserIdentity({
    id: "usr_dev_user",
    name: "Pranav",
    email: "pranav@example.com",
    role: ROLES.USER,
    bio: "AI Engineering Developer",
  }),
  ADMIN: normalizeUserIdentity({
    id: "usr_dev_admin",
    name: "OS Admin",
    email: "admin@example.com",
    role: ROLES.ADMIN,
    bio: "AI Engineer OS Global Administrator",
  }),
};

export default {
  normalizeUserIdentity,
  DEV_IDENTITIES,
};
