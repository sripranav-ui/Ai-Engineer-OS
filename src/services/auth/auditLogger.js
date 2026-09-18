/**
 * @file auditLogger.js
 * @description Architectural Audit Event Logger for Security & Access Events.
 * Integrates with existing eventBus without modifying eventBus.js.
 */

import eventBus from "../plugins/eventBus.js";

export const AUDIT_EVENTS = {
  USER_LOGIN: "AUDIT_USER_LOGIN",
  USER_LOGOUT: "AUDIT_USER_LOGOUT",
  ROLE_CHANGED: "AUDIT_ROLE_CHANGED",
  PERMISSION_DENIED: "AUDIT_PERMISSION_DENIED",
  ADMIN_ACTION: "AUDIT_ADMIN_ACTION",
  RUNTIME_ACTION: "AUDIT_RUNTIME_ACTION",
  GITHUB_ACTION: "AUDIT_GITHUB_ACTION",
  AGENT_ACTION: "AUDIT_AGENT_ACTION",
  SETTINGS_CHANGED: "AUDIT_SETTINGS_CHANGED",
};

/**
 * Log a security audit event
 * @param {string} eventType
 * @param {Object} details
 * @param {Object} [user]
 */
export function logAuditEvent(eventType, details = {}, user = null) {
  const payload = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventType,
    timestamp: new Date().toISOString(),
    userId: user?.id || user?.email || "anonymous",
    userRole: user?.role || "UNKNOWN",
    details,
  };

  eventBus.emit(eventType, payload);
  eventBus.emit("AUDIT_EVENT_LOGGED", payload);
  return payload;
}

export default {
  AUDIT_EVENTS,
  logAuditEvent,
};
