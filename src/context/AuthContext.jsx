import React, { createContext, useState, useEffect, useMemo } from "react";
import authorization from "../services/auth/authorization.js";
import { ROLES, normalizeRole } from "../services/auth/roleDefinitions.js";
import { getPermissionsForRole } from "../services/auth/rolePermissionMap.js";
import { logAuditEvent, AUDIT_EVENTS } from "../services/auth/auditLogger.js";

export const AuthContext = createContext();

// Mock JWT Token seed
const MOCK_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlByYW5hdiIsImlhdCI6MTUxNjIzOTAyMn0.signature";
const MOCK_REFRESH_TOKEN = "refresh_token_ai_engineer_os_secure_ref";

/**
 * Helper to produce a clean session user object with canonical role and permissions
 * @param {Object} rawUser
 * @returns {Object|null}
 */
function toSessionUser(rawUser) {
  if (!rawUser || typeof rawUser !== "object") return null;
  const { password: _, ...rest } = rawUser;
  const role = normalizeRole(rest.role);
  const canonicalPermissions = getPermissionsForRole(role);
  return {
    ...rest,
    role,
    permissions: canonicalPermissions,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({ accessToken: null, refreshToken: null });

  // Helper to read the current users list from localStorage
  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("auth_users")) || [];
    } catch {
      return [];
    }
  };

  // Initialize users database and active session
  useEffect(() => {
    // Seed default users with canonical roles and permissions
    const DEFAULT_USERS = [
      {
        id: "usr_dev_user",
        name: "Pranav",
        email: "pranav@example.com",
        password: "password123",
        role: ROLES.USER,
        permissions: getPermissionsForRole(ROLES.USER),
        bio: "AI Engineering Student & Developer",
        avatarUrl: "",
        joinedDate: "July 2026",
        theme: "light",
        accentName: "Blue",
        accentColor: "#1D1D21",
        accentColorHover: "#2C2C33"
      },
      {
        id: "usr_dev_admin",
        name: "OS Admin",
        email: "admin@example.com",
        password: "adminpassword",
        role: ROLES.ADMIN,
        permissions: getPermissionsForRole(ROLES.ADMIN),
        bio: "AI Engineer OS Global Administrator",
        avatarUrl: "",
        joinedDate: "July 2026",
        theme: "light",
        accentName: "Purple",
        accentColor: "#1D1D21",
        accentColorHover: "#2C2C33"
      }
    ];

    const storedUsers = localStorage.getItem("auth_users");
    if (!storedUsers) {
      localStorage.setItem("auth_users", JSON.stringify(DEFAULT_USERS));
    }

    // Check for active session or auto-seed default session
    const activeSession = localStorage.getItem("auth_session");
    if (activeSession) {
      try {
        const parsedUser = JSON.parse(activeSession);
        const sessionUser = toSessionUser(parsedUser);
        setUser(sessionUser);
        setTokens({ accessToken: MOCK_JWT, refreshToken: MOCK_REFRESH_TOKEN });
      } catch {
        localStorage.removeItem("auth_session");
      }
    } else {
      const sessionUser = toSessionUser(DEFAULT_USERS[0]);
      setUser(sessionUser);
      setTokens({ accessToken: MOCK_JWT, refreshToken: MOCK_REFRESH_TOKEN });
      localStorage.setItem("auth_session", JSON.stringify(sessionUser));
    }
    setLoading(false);
  }, []);

  const hasPermission = (permission) => {
    const allowed = authorization.hasPermission(user, permission);
    if (!allowed && user && permission) {
      logAuditEvent(AUDIT_EVENTS.PERMISSION_DENIED, { permission }, user);
    }
    return allowed;
  };

  const hasRole = (roleName) => authorization.hasRole(user, roleName);
  const hasFeature = (flagName) => authorization.hasPermission(user, flagName);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const allUsers = getUsers();
        const foundUser = allUsers.find(
          (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
        );

        if (foundUser) {
          const sessionUser = toSessionUser(foundUser);
          setUser(sessionUser);
          setTokens({ accessToken: MOCK_JWT, refreshToken: MOCK_REFRESH_TOKEN });
          localStorage.setItem("auth_session", JSON.stringify(sessionUser));

          logAuditEvent(AUDIT_EVENTS.USER_LOGIN, { method: "password" }, sessionUser);
          resolve(sessionUser);
        } else {
          reject(new Error("Invalid email address or security credential."));
        }
      }, 300);
    });
  };

  const register = (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const allUsers = getUsers();
        const existingUser = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (existingUser) {
          reject(new Error("An account with this email address already exists."));
          return;
        }

        const newUser = {
          id: `usr_${Date.now()}`,
          name,
          email: normalizedEmail,
          password,
          role: ROLES.USER,
          permissions: getPermissionsForRole(ROLES.USER),
          bio: "AI Engineering Student",
          avatarUrl: "",
          joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          theme: "light",
          accentName: "Obsidian",
          accentColor: "#1D1D21",
          accentColorHover: "#2C2C33"
        };

        const updatedUsers = [...allUsers, newUser];
        localStorage.setItem("auth_users", JSON.stringify(updatedUsers));

        const sessionUser = toSessionUser(newUser);
        setUser(sessionUser);
        setTokens({ accessToken: MOCK_JWT, refreshToken: MOCK_REFRESH_TOKEN });
        localStorage.setItem("auth_session", JSON.stringify(sessionUser));

        logAuditEvent(AUDIT_EVENTS.USER_LOGIN, { method: "registration" }, sessionUser);
        resolve(sessionUser);
      }, 300);
    });
  };

  const logout = () => {
    if (user) {
      logAuditEvent(AUDIT_EVENTS.USER_LOGOUT, {}, user);
    }
    setUser(null);
    setTokens({ accessToken: null, refreshToken: null });
    localStorage.removeItem("auth_session");
  };

  const updateProfile = (profileData) => {
    return new Promise((resolve, reject) => {
      if (!user) {
        reject(new Error("No authenticated user session."));
        return;
      }

      const oldRole = user.role;
      const newRole = profileData.role ? normalizeRole(profileData.role) : oldRole;

      const users = JSON.parse(localStorage.getItem("auth_users")) || [];
      const updatedUsers = users.map((u) => {
        if (u.email.toLowerCase() === user.email.toLowerCase()) {
          return { ...u, ...profileData, role: newRole };
        }
        return u;
      });

      localStorage.setItem("auth_users", JSON.stringify(updatedUsers));

      const updatedSessionUser = toSessionUser({ ...user, ...profileData, role: newRole });
      setUser(updatedSessionUser);
      localStorage.setItem("auth_session", JSON.stringify(updatedSessionUser));

      if (oldRole !== newRole) {
        logAuditEvent(AUDIT_EVENTS.ROLE_CHANGED, { oldRole, newRole }, updatedSessionUser);
      }

      resolve(updatedSessionUser);
    });
  };

  const updatePassword = (currentPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      if (!user) {
        reject(new Error("No authenticated user session."));
        return;
      }

      const users = JSON.parse(localStorage.getItem("auth_users")) || [];
      const userIndex = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase()
      );

      if (userIndex === -1) {
        reject(new Error("User record not found in system database."));
        return;
      }

      if (users[userIndex].password !== currentPassword) {
        reject(new Error("Current password is incorrect."));
        return;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem("auth_users", JSON.stringify(users));
      resolve();
    });
  };

  const resetPassword = (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem("auth_users")) || [];
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

        if (exists) {
          resolve();
        } else {
          reject(new Error("This email is not registered in our system."));
        }
      }, 300);
    });
  };

  const value = useMemo(() => ({
    user,
    loading,
    tokens,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    resetPassword,
    hasPermission,
    hasRole,
    hasFeature
  }), [user, loading, tokens]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function Authorize({ children, permissions = [], roles = [], fallback = null }) {
  const { hasPermission, hasRole } = React.useContext(AuthContext);
  
  const isAllowed = useMemo(() => {
    const permAllowed = permissions.length === 0 || permissions.some(hasPermission);
    const roleAllowed = roles.length === 0 || roles.some(hasRole);
    return permAllowed && roleAllowed;
  }, [permissions, roles, hasPermission, hasRole]);

  return isAllowed ? children : fallback;
}

export default AuthContext;

