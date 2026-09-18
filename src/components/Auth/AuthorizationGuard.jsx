import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  hasPermission,
  hasRole,
  hasAnyPermission,
  hasAllPermissions,
} from "../../services/auth/authorization.js";

/**
 * AuthorizationGuard
 * Reusable React capability and role guard component.
 *
 * NOTE: Frontend authorization controls UI component and route visibility only.
 * Native runtime security, command policy, and workspace guards remain the primary
 * enforced security boundary.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.permission]
 * @param {Array<string>} [props.permissions]
 * @param {string} [props.role]
 * @param {Array<string>} [props.roles]
 * @param {boolean} [props.requireAll]
 * @param {React.ReactNode} [props.fallback]
 */
export function AuthorizationGuard({
  children,
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  fallback = null,
}) {
  const { user } = useContext(AuthContext) || {};

  // Fail closed if user identity is missing or invalid
  if (!user || typeof user !== "object") {
    return fallback;
  }

  // Check single role requirement
  if (role && !hasRole(user, role)) {
    return fallback;
  }

  // Check multiple roles requirement
  if (roles.length > 0) {
    const roleAllowed = roles.some((r) => hasRole(user, r));
    if (!roleAllowed) {
      return fallback;
    }
  }

  // Check single permission requirement
  if (permission && !hasPermission(user, permission)) {
    return fallback;
  }

  // Check multiple permissions requirement
  if (permissions.length > 0) {
    const permAllowed = requireAll
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions);

    if (!permAllowed) {
      return fallback;
    }
  }

  return children;
}

export default AuthorizationGuard;
