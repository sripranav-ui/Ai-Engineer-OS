/**
 * @file runtimeClient.test.js
 * @description Unit tests for RuntimeClient structured requests, protocol validation,
 * authorization enforcement, command policy checks, and audit logging.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runtimeClient } from "./runtimeClient.js";
import { STRUCTURED_OPERATIONS, createRuntimeRequest, validateRuntimeRequest } from "./runtimeProtocol.js";
import { RUNTIME_ERROR_CODES } from "./runtimeErrors.js";
import { DEV_IDENTITIES } from "../auth/authService.js";

describe("Runtime Protocol Request/Response Validation", () => {
  it("should create valid structured runtime request", () => {
    const req = createRuntimeRequest(STRUCTURED_OPERATIONS.FILESYSTEM_READ, { path: "src/App.jsx" });
    assert.ok(req.id.startsWith("req_"));
    assert.equal(req.operation, STRUCTURED_OPERATIONS.FILESYSTEM_READ);
    assert.equal(req.payload.path, "src/App.jsx");

    const val = validateRuntimeRequest(req);
    assert.equal(val.valid, true);
  });

  it("should reject malformed requests", () => {
    assert.equal(validateRuntimeRequest(null).valid, false);
    assert.equal(validateRuntimeRequest({ id: "123" }).valid, false);
    assert.equal(validateRuntimeRequest({ id: "123", operation: "invalid.op", payload: {} }).valid, false);
  });
});

describe("RuntimeClient Authorization Enforcement & Security", () => {
  it("should DENY request if user identity is missing or null", async () => {
    const res = await runtimeClient.request(STRUCTURED_OPERATIONS.FILESYSTEM_READ, { path: "src/App.jsx" }, null);
    assert.equal(res.success, false);
    assert.equal(res.error.code, RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE);
  });

  it("should DENY command execution if user lacks execute_terminal permission", async () => {
    const restrictedUser = { id: "u2", role: "USER", permissions: [] };
    const res = await runtimeClient.executeCommand("dir", "D:\\coding\\AI-Engineer-OS", restrictedUser);
    assert.equal(res.success, false);
    assert.equal(res.error.code, RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE);
  });

  it("should ALLOW authorized user filesystem read request", async () => {
    const res = await runtimeClient.readFile("package.json", DEV_IDENTITIES.USER);
    assert.equal(res.success, true);
    assert.ok(res.data.output);
  });

  it("should BLOCK path traversal attempt and return WORKSPACE_VIOLATION", async () => {
    const res = await runtimeClient.readFile("../../../windows/system32", DEV_IDENTITIES.USER);
    assert.equal(res.success, false);
    assert.equal(res.error.code, RUNTIME_ERROR_CODES.WORKSPACE_VIOLATION);
  });

  it("should BLOCK destructive command execution via Command Policy", async () => {
    const res = await runtimeClient.executeCommand("rm -rf /", "D:\\coding\\AI-Engineer-OS", DEV_IDENTITIES.ADMIN);
    assert.equal(res.success, false);
    assert.equal(res.error.code, RUNTIME_ERROR_CODES.COMMAND_BLOCKED);
  });
});

describe("RuntimeClient Audit Logging", () => {
  it("should append entries to audit log on operation calls", async () => {
    await runtimeClient.readFile("package.json", DEV_IDENTITIES.USER);
    const logs = runtimeClient.getAuditLogs(5);
    assert.ok(logs.length > 0);
    assert.ok(logs[0].id.startsWith("log_"));
    assert.ok(logs[0].operation);
  });
});
