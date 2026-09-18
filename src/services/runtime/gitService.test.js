/**
 * @file gitService.test.js
 * @description Unit tests for GitService inspection operations, branch creation/switching, commit execution, and authorization checks.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { gitService } from "./gitService.js";
import { DEV_IDENTITIES } from "../auth/authService.js";

describe("GitService Inspection Operations", () => {
  const user = DEV_IDENTITIES.USER;

  it("should check if active directory is a Git repository", async () => {
    const isRepo = await gitService.isRepository(user);
    assert.equal(typeof isRepo, "boolean");
  });

  it("should get Git status", async () => {
    const res = await gitService.getStatus(user);
    assert.equal(res.success, true);
    assert.ok(res.status);
  });

  it("should get Git diff", async () => {
    const res = await gitService.getDiff(user);
    assert.equal(res.success, true);
    assert.equal(typeof res.diff, "string");
  });

  it("should get Git branches", async () => {
    const res = await gitService.getBranches(user);
    assert.equal(res.success, true);
    assert.ok(Array.isArray(res.branches));
  });

  it("should get current active branch name", async () => {
    const branch = await gitService.getCurrentBranch(user);
    assert.equal(typeof branch, "string");
    assert.ok(branch.length > 0);
  });

  it("should get Git commit log history", async () => {
    const res = await gitService.getLog(5, user);
    assert.equal(res.success, true);
    assert.equal(typeof res.log, "string");
  });

  it("should create branch via structured GitService request", async () => {
    const res = await gitService.createBranch("feat/test-branch", user);
    assert.equal(res.success, true);
    assert.equal(res.branchName, "feat/test-branch");
  });

  it("should switch branch via structured GitService request", async () => {
    const res = await gitService.switchBranch("main", user);
    assert.equal(res.success, true);
    assert.equal(res.branchName, "main");
  });

  it("should execute commit via structured GitService request", async () => {
    const res = await gitService.commit("feat: test commit", user, { userApproved: true });
    assert.equal(res.success, true);
    assert.ok(res.hash);
  });
});

describe("GitService Security Guards", () => {
  it("should REJECT Git status if user session is missing", async () => {
    await assert.rejects(
      async () => {
        await gitService.getStatus(null);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT Git diff if user lacks read_repository permission", async () => {
    const unprivilegedUser = { id: "u_none", role: "USER", permissions: [] };
    await assert.rejects(
      async () => {
        await gitService.getDiff(unprivilegedUser);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT branch switching if user lacks switch_branch permission", async () => {
    const unprivilegedUser = { id: "u_none", role: "USER", permissions: [] };
    await assert.rejects(
      async () => {
        await gitService.switchBranch("main", unprivilegedUser);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });
});
