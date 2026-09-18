/**
 * @file repositoryService.test.js
 * @description Comprehensive unit tests for Step 4 Repository Engineering Layer,
 * Secret Scanner, Working Tree Guard, Branch Safety, and Commit Safety.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import secretScanner from "./secretScanner.js";
import workingTreeGuard from "./workingTreeGuard.js";
import repositoryService from "./repositoryService.js";
import { DEV_IDENTITIES } from "../auth/authService.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";

describe("Secret Scanner Engine", () => {
  it("should detect OpenAI API key", () => {
    const text = "const apiKey = 'sk-proj1234567890123456789012345';";
    const res = secretScanner.scanContent(text);
    assert.equal(res.clean, false);
    assert.ok(res.findings.length > 0);
    assert.equal(res.findings[0].type, "OpenAI / Generic API Key");
  });

  it("should detect GitHub Personal Access Token", () => {
    const text = "const token = 'ghp_1234567890abcdef1234567890abcdef';";
    const res = secretScanner.scanContent(text);
    assert.equal(res.clean, false);
    assert.equal(res.findings[0].type, "GitHub Personal Access Token");
  });

  it("should detect Private RSA Key", () => {
    const text = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----";
    const res = secretScanner.scanContent(text);
    assert.equal(res.clean, false);
    assert.equal(res.findings[0].type, "RSA / PGP Private Key");
  });

  it("should redact secrets and NEVER return raw secret string in output", () => {
    const text = "sk-123456789012345678901234567890";
    const redacted = secretScanner.redactSecrets(text);
    assert.equal(redacted.includes("sk-123456789012345678901234567890"), false);
    assert.ok(redacted.includes("[REDACTED_"));
  });

  it("should handle normal non-secret code safely without false positives", () => {
    const code = "function calculateTotal(price, tax) { return price * tax; }";
    const res = secretScanner.scanContent(code);
    assert.equal(res.clean, true);
    assert.equal(res.count, 0);
  });
});

describe("Working Tree Guard & Policy", () => {
  it("should parse clean status output", () => {
    const output = "On branch main\nnothing to commit, working tree clean";
    const info = workingTreeGuard.analyzeStatus(output);
    assert.equal(info.clean, true);
    assert.equal(info.currentBranch, "main");
    assert.equal(info.isDetached, false);
  });

  it("should parse dirty status output with modified files", () => {
    const output = "On branch feature-x\n M src/App.jsx\n M package.json";
    const info = workingTreeGuard.analyzeStatus(output);
    assert.equal(info.clean, false);
    assert.equal(info.currentBranch, "feature-x");
    assert.ok(info.modifiedFiles.length > 0);
  });

  it("should detect protected branches ('main', 'master')", () => {
    assert.equal(workingTreeGuard.isProtectedBranch("main"), true);
    assert.equal(workingTreeGuard.isProtectedBranch("master"), true);
    assert.equal(workingTreeGuard.isProtectedBranch("feature/dev"), false);
  });

  it("should REJECT branch switch when working tree is dirty", () => {
    const dirtyInfo = { clean: false, inMerge: false, inRebase: false, modifiedFiles: ["src/App.jsx"] };
    const safety = workingTreeGuard.evaluateOperationSafety("switchBranch", dirtyInfo, { targetBranch: "dev" });
    assert.equal(safety.safe, false);
    assert.ok(safety.error.includes("uncommitted changes"));
  });

  it("should REJECT branch creation with invalid branch name syntax", () => {
    const cleanInfo = { clean: true, inMerge: false, inRebase: false, modifiedFiles: [] };
    const safety = workingTreeGuard.evaluateOperationSafety("createBranch", cleanInfo, { branchName: "-invalid-name" });
    assert.equal(safety.safe, false);
    assert.ok(safety.error.includes("Invalid branch name syntax"));
  });
});

describe("RepositoryService High-Level Operations & Safety", () => {
  const user = DEV_IDENTITIES.USER;

  it("should inspect repository state safely", async () => {
    const state = await repositoryService.getRepositoryState(user);
    assert.equal(typeof state.isRepository, "boolean");
    assert.ok(state.root);
  });

  it("should ALLOW branch creation for authorized user", async () => {
    const res = await repositoryService.createBranch("feature-test-step4", user);
    assert.equal(res.success, true);
  });

  it("should ALLOW branch switching for user with PERMISSIONS.SWITCH_BRANCH", async () => {
    const res = await repositoryService.switchBranch("main", user);
    assert.equal(res.success, true);
  });

  it("should REJECT branch switching if user lacks PERMISSIONS.SWITCH_BRANCH", async () => {
    const unprivilegedUser = { id: "u_no_switch", role: "USER", permissions: [PERMISSIONS.READ_REPOSITORY] };
    await assert.rejects(
      async () => {
        await repositoryService.switchBranch("main", unprivilegedUser);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT commit preparation if user approval is missing", async () => {
    await assert.rejects(
      async () => {
        await repositoryService.prepareCommit("feat: add feature", user, { userApproved: false, allowEmpty: true });
      },
      (err) => err.code === "AUTHORIZATION_FAILURE" && err.details.requiresApproval === true
    );
  });

  it("should REJECT commit preparation if commit message contains raw API key", async () => {
    const leakyMsg = "feat: add api key sk-123456789012345678901234567890";
    await assert.rejects(
      async () => {
        await repositoryService.prepareCommit(leakyMsg, user, { userApproved: true, allowEmpty: true });
      },
      (err) => err.code === "COMMAND_BLOCKED" && err.message.includes("Secret scanner detected")
    );
  });

  it("should ALLOW commit execution for authorized user with approval and clean payload", async () => {
    const res = await repositoryService.prepareCommit("feat: safe commit message", user, { userApproved: true, allowEmpty: true });
    assert.equal(res.success, true);
  });
});
