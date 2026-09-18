import test from "node:test";
import assert from "node:assert";
import { classifyCommand, COMMAND_RISK_LEVELS, redactSecrets } from "../src/security/commandPolicy.js";

test("Command Policy - Safety Classification & Injection Guard", async (t) => {
  await t.test("SAFE commands classification", () => {
    const safeCmds = [
      "git status",
      "git diff",
      "git log",
      "git branch --list",
      "git rev-parse HEAD",
      "git remote -v",
    ];

    for (const cmd of safeCmds) {
      const res = classifyCommand(cmd);
      assert.strictEqual(res.level, COMMAND_RISK_LEVELS.SAFE, `Expected SAFE for: ${cmd}`);
      assert.strictEqual(res.allowed, true);
    }
  });

  await t.test("APPROVAL_REQUIRED commands classification", () => {
    const approvalCmds = [
      "git branch new-feature",
      "git checkout -b dev",
      "git switch main",
      "git add .",
      "git commit -m 'test'",
      "git push origin main",
      "npm install react",
    ];

    for (const cmd of approvalCmds) {
      const res = classifyCommand(cmd);
      assert.strictEqual(res.level, COMMAND_RISK_LEVELS.APPROVAL_REQUIRED, `Expected APPROVAL_REQUIRED for: ${cmd}`);
    }
  });

  await t.test("BLOCKED commands classification", () => {
    const blockedCmds = [
      "git reset --hard",
      "git clean -fd",
      "git checkout -- .",
      "git restore .",
      "git clean -xdf",
      "git reset --merge",
      "git reset --keep",
      "git push --force",
      "git push origin main -f",
      "del /s /q C:\\",
      "rmdir /s /q D:\\",
      "Remove-Item -Recurse -Force .",
      "format C:",
    ];

    for (const cmd of blockedCmds) {
      const res = classifyCommand(cmd);
      assert.strictEqual(res.level, COMMAND_RISK_LEVELS.BLOCKED, `Expected BLOCKED for: ${cmd}`);
      assert.strictEqual(res.allowed, false);
    }
  });

  await t.test("Shell operator chaining & injection attempts blocked", () => {
    const injectionCmds = [
      "git status && git reset --hard",
      "git status; rm -rf /",
      "git log | del /q C:\\",
      "git status $(format C:)",
      "git status `rmdir /s /q .`",
    ];

    for (const cmd of injectionCmds) {
      const res = classifyCommand(cmd);
      assert.strictEqual(res.level, COMMAND_RISK_LEVELS.BLOCKED, `Expected BLOCKED for injection attempt: ${cmd}`);
      assert.strictEqual(res.allowed, false);
    }
  });

  await t.test("Secret redaction replaces tokens, keys, and credentials", () => {
    const textWithSecrets = "Token: runtime_tok_1234567890abcdef1234567890abcdef Key: ghp_123456789012345678901234567890123456 Auth: Bearer token12345678901234567890";
    const redacted = redactSecrets(textWithSecrets);
    assert.strictEqual(redacted.includes("runtime_tok_"), false);
    assert.strictEqual(redacted.includes("ghp_"), false);
    assert.strictEqual(redacted.includes("[REDACTED]"), true);
  });
});
