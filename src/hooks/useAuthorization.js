import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import authorization from "../services/auth/authorization.js";

/**
 * Custom hook providing pure authorization helpers bound to active session user
 * @returns {{
 *   user: Object,
 *   isAdmin: boolean,
 *   isUser: boolean,
 *   hasRole: (role: string) => boolean,
 *   hasPermission: (permission: string) => boolean,
 *   hasAnyPermission: (permissions: string[]) => boolean,
 *   hasAllPermissions: (permissions: string[]) => boolean
 * }}
 */
export function useAuthorization() {
  const { user } = useContext(AuthContext) || {};

  return useMemo(() => ({
    user,
    isAdmin: authorization.isAdmin(user),
    isUser: authorization.isUser(user),
    hasRole: (role) => authorization.hasRole(user, role),
    hasPermission: (permission) => authorization.hasPermission(user, permission),
    hasAnyPermission: (permissions) => authorization.hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions) => authorization.hasAllPermissions(user, permissions),
  }), [user]);
}

export default useAuthorization;
