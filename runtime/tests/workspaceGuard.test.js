import test from "node:test";
import assert from "node:assert";
import path from "node:path";
import { validateWorkspacePath, resolveWorkspacePath } from "../src/security/workspaceGuard.js";

const workspaceRoot = process.cwd();

test("Workspace Guard - Path Traversal & Containment Validation", async (t) => {
  await t.test("Valid relative workspace files are accepted", () => {
    const res = validateWorkspacePath("package.json", workspaceRoot);
    assert.strictEqual(res.valid, true);
    assert.ok(res.canonicalPath.endsWith("package.json"));
  });

  await t.test("Nested workspace files are accepted", () => {
    const res = validateWorkspacePath("src/App.jsx", workspaceRoot);
    assert.strictEqual(res.valid, true);
    assert.ok(res.canonicalPath.includes("App.jsx"));
  });

  await t.test("Workspace root itself is accepted", () => {
    const res = validateWorkspacePath(".", workspaceRoot);
    assert.strictEqual(res.valid, true);
  });

  await t.test("../ traversal is rejected", () => {
    const res = validateWorkspacePath("../secret.txt", workspaceRoot);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes("Path traversal"));
  });

  await t.test("../../ deep traversal is rejected", () => {
    const res = validateWorkspacePath("../../Windows/System32", workspaceRoot);
    assert.strictEqual(res.valid, false);
  });

  await t.test("Absolute path outside workspace is rejected", () => {
    const res = validateWorkspacePath("C:\\Windows\\System32\\cmd.exe", workspaceRoot);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes("escapes active workspace boundary"));
  });

  await t.test("Windows drive escape is rejected", () => {
    const res = validateWorkspacePath("C:/Users/Administrator", workspaceRoot);
    assert.strictEqual(res.valid, false);
  });

  await t.test("Prefix attack (workspace-SECRET) is rejected", () => {
    const fakeWorkspace = "D:\\coding\\AI-Engineer-OS";
    const attackPath = "D:\\coding\\AI-Engineer-OS-SECRET\\passwords.txt";
    const res = validateWorkspacePath(attackPath, fakeWorkspace);
    assert.strictEqual(res.valid, false);
  });

  await t.test("URL encoded traversal (%2e%2e) is rejected", () => {
    const res = validateWorkspacePath("%2e%2e/etc/passwd", workspaceRoot);
    assert.strictEqual(res.valid, false);
  });

  await t.test("resolveWorkspacePath helper throws security error on escape", () => {
    assert.throws(
      () => resolveWorkspacePath(workspaceRoot, "../outside.txt"),
      /\[Security Violation\]/
    );
  });
});
