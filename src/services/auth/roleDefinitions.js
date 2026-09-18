/**
 * @file roleDefinitions.js
 * @description Canonical Role Definitions for AI Engineer OS.
 */

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

/**
 * Role Metadata
 */
export const ROLE_METADATA = {
  [ROLES.USER]: {
    id: ROLES.USER,
    label: "Standard User",
    description: "Standard developer workspace identity with access to core AI tools.",
  },
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    label: "System Administrator",
    description: "Full system administration identity with administrative configuration access.",
  },
};

/**
 * Map legacy role strings (e.g. 'student') to canonical roles
 * @param {string} roleString
 * @returns {string} Canonical role
 */
export function normalizeRole(roleString = "") {
  if (!roleString || typeof roleString !== "string") {
    return ROLES.USER;
  }
  const clean = roleString.trim().toUpperCase();
  if (clean === "ADMIN") return ROLES.ADMIN;
  if (clean === "STUDENT" || clean === "USER") return ROLES.USER;
  return ROLES.USER;
}

export default {
  ROLES,
  ROLE_METADATA,
  normalizeRole,
};
