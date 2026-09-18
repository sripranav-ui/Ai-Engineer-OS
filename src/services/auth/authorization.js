/**
 * @file authorization.js
 * @description Centralized Pure Authorization Evaluation Engine.
 * Fails closed on missing or malformed input parameters.
 */

import { ROLES, normalizeRole } from "./roleDefinitions.js";
import { ROLE_PERMISSION_MAP } from "./rolePermissionMap.js";

/**
 * Check if user possesses a canonical role
 * @param {Object} user
 * @param {string} targetRole
 * @returns {boolean}
 */
export function hasRole(user, targetRole) {
  if (!user || typeof user !== "object" || !targetRole) {
    return false;
  }
  const userRole = normalizeRole(user.role);
  const checkRole = normalizeRole(targetRole);
  return userRole === checkRole;
}

/**
 * Check if user is an Administrator
 * @param {Object} user
 * @returns {boolean}
 */
export function isAdmin(user) {
  return hasRole(user, ROLES.ADMIN);
}

/**
 * Check if user is a Standard User
 * @param {Object} user
 * @returns {boolean}
 */
export function isUser(user) {
  return hasRole(user, ROLES.USER);
}

/**
 * Check if user possesses a capability permission
 * @param {Object} user
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || typeof user !== "object" || !permission || typeof permission !== "string") {
    return false;
  }

  // If user object defines an explicit custom permissions array, evaluate against it
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes("*") || user.permissions.includes(permission);
  }

  // Fallback to role-based permission map
  const userRole = normalizeRole(user.role);
  const rolePermissions = ROLE_PERMISSION_MAP[userRole] || ROLE_PERMISSION_MAP[ROLES.USER];
  return rolePermissions.has(permission);
}

/**
 * Check if user possesses ANY of the specified permissions
 * @param {Object} user
 * @param {Array<string>} permissions
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions = []) {
  if (!user || !Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }
  return permissions.some((perm) => hasPermission(user, perm));
}

/**
 * Check if user possesses ALL of the specified permissions
 * @param {Object} user
 * @param {Array<string>} permissions
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions = []) {
  if (!user || !Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }
  return permissions.every((perm) => hasPermission(user, perm));
}

export default {
  hasRole,
  isAdmin,
  isUser,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
};
