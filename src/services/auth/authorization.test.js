/**
 * @file authorization.test.js
 * @description Unit tests for Step 2 User/Admin Role Architecture.
 * Executed using `node --test`.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ROLES, normalizeRole } from "./roleDefinitions.js";
import { PERMISSIONS } from "./permissionDefinitions.js";
import {
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isUser,
} from "./authorization.js";
import { normalizeUserIdentity, DEV_IDENTITIES } from "./authService.js";
import { logAuditEvent, AUDIT_EVENTS } from "./auditLogger.js";

describe("Role Normalization & Definitions", () => {
  it("should normalize 'USER', 'USER', 'STUDENT', and 'student' to ROLES.USER", () => {
    assert.equal(normalizeRole("USER"), ROLES.USER);
    assert.equal(normalizeRole("student"), ROLES.USER);
    assert.equal(normalizeRole("STUDENT"), ROLES.USER);
    assert.equal(normalizeRole("user"), ROLES.USER);
  });

  it("should normalize 'ADMIN' and 'admin' to ROLES.ADMIN", () => {
    assert.equal(normalizeRole("ADMIN"), ROLES.ADMIN);
    assert.equal(normalizeRole("admin"), ROLES.ADMIN);
  });

  it("should default unknown or empty roles to ROLES.USER", () => {
    assert.equal(normalizeRole(""), ROLES.USER);
    assert.equal(normalizeRole(null), ROLES.USER);
    assert.equal(normalizeRole(undefined), ROLES.USER);
    assert.equal(normalizeRole("UNKNOWN_ROLE"), ROLES.USER);
  });
});

describe("Authorization Evaluation — USER Role", () => {
  const userIdentity = normalizeUserIdentity({
    id: "u1",
    name: "Standard User",
    email: "user@example.com",
    role: "USER",
  });

  it("should identify user as USER and not ADMIN", () => {
    assert.equal(isUser(userIdentity), true);
    assert.equal(isAdmin(userIdentity), false);
    assert.equal(hasRole(userIdentity, "USER"), true);
    assert.equal(hasRole(userIdentity, "ADMIN"), false);
  });

  it("should allow normal user permissions", () => {
    assert.equal(hasPermission(userIdentity, PERMISSIONS.USE_AI_ASSISTANT), true);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.ACCESS_CODING_STUDIO), true);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.ACCESS_KNOWLEDGE), true);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.CREATE_PROJECT), true);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.ACCESS_RUNTIME), true);
  });

  it("should DENY administrative permissions to USER", () => {
    assert.equal(hasPermission(userIdentity, PERMISSIONS.ACCESS_ADMIN), false);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.MANAGE_USERS), false);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.MANAGE_ROLES), false);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.VIEW_AUDIT_LOGS), false);
    assert.equal(hasPermission(userIdentity, PERMISSIONS.MANAGE_RUNTIME_CONFIGURATION), false);
  });

  it("should map legacy 'student' role user correctly", () => {
    const studentUser = { id: "s1", role: "student" };
    assert.equal(isUser(studentUser), true);
    assert.equal(hasPermission(studentUser, PERMISSIONS.ACCESS_CODING_STUDIO), true);
    assert.equal(hasPermission(studentUser, PERMISSIONS.MANAGE_USERS), false);
  });
});

describe("Authorization Evaluation — ADMIN Role", () => {
  const adminIdentity = normalizeUserIdentity({
    id: "a1",
    name: "System Admin",
    email: "admin@example.com",
    role: "ADMIN",
  });

  it("should identify user as ADMIN", () => {
    assert.equal(isAdmin(adminIdentity), true);
    assert.equal(hasRole(adminIdentity, "ADMIN"), true);
  });

  it("should allow BOTH normal and administrative permissions", () => {
    assert.equal(hasPermission(adminIdentity, PERMISSIONS.USE_AI_ASSISTANT), true);
    assert.equal(hasPermission(adminIdentity, PERMISSIONS.ACCESS_ADMIN), true);
    assert.equal(hasPermission(adminIdentity, PERMISSIONS.MANAGE_USERS), true);
    assert.equal(hasPermission(adminIdentity, PERMISSIONS.VIEW_AUDIT_LOGS), true);
    assert.equal(hasPermission(adminIdentity, PERMISSIONS.MANAGE_RUNTIME_CONFIGURATION), true);
  });
});

describe("GitHub & Remote Collaboration Capability Permissions", () => {
  const user = DEV_IDENTITIES.USER;
  const admin = DEV_IDENTITIES.ADMIN;

  it("should ALLOW USER access to connect, read remote repo, read issues, read PRs, and prepare PR", () => {
    assert.equal(hasPermission(user, PERMISSIONS.CONNECT_GITHUB), true);
    assert.equal(hasPermission(user, PERMISSIONS.READ_REMOTE_REPOSITORY), true);
    assert.equal(hasPermission(user, PERMISSIONS.READ_GITHUB_ISSUES), true);
    assert.equal(hasPermission(user, PERMISSIONS.READ_GITHUB_PULL_REQUESTS), true);
    assert.equal(hasPermission(user, PERMISSIONS.PREPARE_PULL_REQUEST), true);
  });

  it("should DENY USER capability permission to CREATE_PULL_REQUEST", () => {
    assert.equal(hasPermission(user, PERMISSIONS.CREATE_PULL_REQUEST), false);
  });

  it("should ALLOW ADMIN full access including CREATE_PULL_REQUEST", () => {
    assert.equal(hasPermission(admin, PERMISSIONS.CONNECT_GITHUB), true);
    assert.equal(hasPermission(admin, PERMISSIONS.READ_REMOTE_REPOSITORY), true);
    assert.equal(hasPermission(admin, PERMISSIONS.READ_GITHUB_ISSUES), true);
    assert.equal(hasPermission(admin, PERMISSIONS.READ_GITHUB_PULL_REQUESTS), true);
    assert.equal(hasPermission(admin, PERMISSIONS.PREPARE_PULL_REQUEST), true);
    assert.equal(hasPermission(admin, PERMISSIONS.CREATE_PULL_REQUEST), true);
  });

  it("should DENY access on unknown or non-existent GitHub permissions", () => {
    assert.equal(hasPermission(user, "invalid_github_permission"), false);
    assert.equal(hasPermission(admin, "NON_EXISTENT_GITHUB_ACTION"), false);
  });
});

describe("Multi-Permission Array Checks", () => {
  const user = DEV_IDENTITIES.USER;
  const admin = DEV_IDENTITIES.ADMIN;

  it("hasAnyPermission should return true if at least one permission matches", () => {
    assert.equal(
      hasAnyPermission(user, [PERMISSIONS.ACCESS_ADMIN, PERMISSIONS.USE_AI_ASSISTANT]),
      true
    );
    assert.equal(
      hasAnyPermission(user, [PERMISSIONS.ACCESS_ADMIN, PERMISSIONS.MANAGE_USERS]),
      false
    );
  });

  it("hasAllPermissions should return true only if all permissions match", () => {
    assert.equal(
      hasAllPermissions(user, [PERMISSIONS.USE_AI_ASSISTANT, PERMISSIONS.ACCESS_CODING_STUDIO]),
      true
    );
    assert.equal(
      hasAllPermissions(user, [PERMISSIONS.USE_AI_ASSISTANT, PERMISSIONS.ACCESS_ADMIN]),
      false
    );
    assert.equal(
      hasAllPermissions(admin, [PERMISSIONS.USE_AI_ASSISTANT, PERMISSIONS.ACCESS_ADMIN]),
      true
    );
  });
});

describe("Fail-Closed Security Checks", () => {
  it("should DENY access on null, undefined, or empty user objects", () => {
    assert.equal(hasRole(null, "USER"), false);
    assert.equal(hasRole(undefined, "ADMIN"), false);
    assert.equal(isAdmin(null), false);
    assert.equal(isUser(undefined), false);
    assert.equal(hasPermission(null, PERMISSIONS.USE_AI_ASSISTANT), false);
    assert.equal(hasPermission(undefined, PERMISSIONS.ACCESS_ADMIN), false);
    assert.equal(hasAnyPermission(null, [PERMISSIONS.USE_AI_ASSISTANT]), false);
    assert.equal(hasAllPermissions(null, [PERMISSIONS.USE_AI_ASSISTANT]), false);
  });

  it("should DENY access on malformed permission strings", () => {
    const user = DEV_IDENTITIES.USER;
    assert.equal(hasPermission(user, null), false);
    assert.equal(hasPermission(user, 12345), false);
    assert.equal(hasPermission(user, ""), false);
  });
});

describe("Audit Event Logger Integration", () => {
  it("should construct valid audit log payload", () => {
    const user = DEV_IDENTITIES.USER;
    const payload = logAuditEvent(
      AUDIT_EVENTS.PERMISSION_DENIED,
      { attemptedPermission: PERMISSIONS.ACCESS_ADMIN },
      user
    );

    assert.ok(payload.id.startsWith("audit_"));
    assert.equal(payload.eventType, AUDIT_EVENTS.PERMISSION_DENIED);
    assert.equal(payload.userId, user.id);
    assert.equal(payload.userRole, "USER");
    assert.equal(payload.details.attemptedPermission, PERMISSIONS.ACCESS_ADMIN);
  });
});
