/**
 * @file routeAuthorization.test.js
 * @description Focused unit tests for Step 3B Route-Level Authorization mapping and fail-closed rules.
 * Executed via `node --test`.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PERMISSIONS } from "./permissionDefinitions.js";
import { hasPermission } from "./authorization.js";
import { DEV_IDENTITIES } from "./authService.js";

describe("Step 3B Route-Level Authorization Mapping", () => {
  const standardUser = DEV_IDENTITIES.USER;
  const adminUser = DEV_IDENTITIES.ADMIN;
  const restrictedUser = {
    id: "usr_restricted",
    role: "USER",
    permissions: [], // empty permissions array
  };

  it("1. USER with required permission can access protected routes", () => {
    assert.equal(hasPermission(standardUser, PERMISSIONS.USE_AI_ASSISTANT), true); // /
    assert.equal(hasPermission(standardUser, PERMISSIONS.ACCESS_CODING_STUDIO), true); // /coding-workspace
    assert.equal(hasPermission(standardUser, PERMISSIONS.ACCESS_KNOWLEDGE), true); // /knowledge
    assert.equal(hasPermission(standardUser, PERMISSIONS.ACCESS_PLANNER), true); // /planner
    assert.equal(hasPermission(standardUser, PERMISSIONS.ACCESS_NOTES), true); // /notes
  });

  it("2. USER without required permission is denied access", () => {
    assert.equal(hasPermission(restrictedUser, PERMISSIONS.USE_AI_ASSISTANT), false);
    assert.equal(hasPermission(restrictedUser, PERMISSIONS.ACCESS_CODING_STUDIO), false);
    assert.equal(hasPermission(restrictedUser, PERMISSIONS.ACCESS_KNOWLEDGE), false);
    assert.equal(hasPermission(restrictedUser, PERMISSIONS.ACCESS_PLANNER), false);
    assert.equal(hasPermission(restrictedUser, PERMISSIONS.ACCESS_NOTES), false);
  });

  it("3. Missing session/user is denied (fail closed)", () => {
    assert.equal(hasPermission(null, PERMISSIONS.USE_AI_ASSISTANT), false);
    assert.equal(hasPermission(undefined, PERMISSIONS.ACCESS_CODING_STUDIO), false);
  });

  it("4. ADMIN receives access through canonical permissions map", () => {
    assert.equal(hasPermission(adminUser, PERMISSIONS.USE_AI_ASSISTANT), true);
    assert.equal(hasPermission(adminUser, PERMISSIONS.ACCESS_CODING_STUDIO), true);
    assert.equal(hasPermission(adminUser, PERMISSIONS.ACCESS_KNOWLEDGE), true);
    assert.equal(hasPermission(adminUser, PERMISSIONS.ACCESS_PLANNER), true);
    assert.equal(hasPermission(adminUser, PERMISSIONS.ACCESS_NOTES), true);
  });

  it("5. Evaluated without render-time side effects or uncaught exceptions", () => {
    assert.doesNotThrow(() => {
      hasPermission(standardUser, PERMISSIONS.ACCESS_CODING_STUDIO);
      hasPermission(restrictedUser, PERMISSIONS.ACCESS_CODING_STUDIO);
      hasPermission(null, PERMISSIONS.ACCESS_CODING_STUDIO);
    });
  });
});
