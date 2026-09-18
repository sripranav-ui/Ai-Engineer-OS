/**
 * @file filesystemService.test.js
 * @description Unit tests for FilesystemService operations, authorization checks, and workspace containment validation.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { filesystemService } from "./filesystemService.js";
import { DEV_IDENTITIES } from "../auth/authService.js";

describe("FilesystemService Operations", () => {
  const user = DEV_IDENTITIES.USER;

  it("should successfully read valid workspace file", async () => {
    const res = await filesystemService.readFile("package.json", user);
    assert.equal(res.success, true);
    assert.ok(res.output);
  });

  it("should successfully write valid workspace file", async () => {
    const res = await filesystemService.writeFile("test_temp.txt", "hello world", user);
    assert.equal(res.success, true);
  });

  it("should list directory contents", async () => {
    const res = await filesystemService.listDirectory("src", user);
    assert.equal(res.success, true);
  });

  it("should check if file exists", async () => {
    const exists = await filesystemService.exists("package.json", user);
    assert.equal(exists, true);
  });

  it("should stat file metadata", async () => {
    const statObj = await filesystemService.stat("package.json", user);
    assert.ok(statObj);
  });
});

describe("FilesystemService Security Guards", () => {
  const user = DEV_IDENTITIES.USER;

  it("should REJECT path traversal attempts ('../')", async () => {
    await assert.rejects(
      async () => {
        await filesystemService.readFile("../secret.txt", user);
      },
      (err) => err.code === "WORKSPACE_VIOLATION"
    );
  });

  it("should REJECT absolute path escape attempts", async () => {
    await assert.rejects(
      async () => {
        await filesystemService.readFile("C:\\Windows\\System32\\drivers\\etc\\hosts", user);
      },
      (err) => err.code === "WORKSPACE_VIOLATION"
    );
  });

  it("should REJECT operation when user session is missing or unauthenticated", async () => {
    await assert.rejects(
      async () => {
        await filesystemService.readFile("package.json", null);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });
});
