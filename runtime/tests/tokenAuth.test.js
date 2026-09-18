import test from "node:test";
import assert from "node:assert";
import tokenAuth from "../src/security/tokenAuth.js";

test("TokenAuthManager - Security & Fail-Closed Validation", async (t) => {
  await t.test("Valid token passes validation", () => {
    const rawToken = tokenAuth._getRawTokenForTestingOnly();
    assert.strictEqual(tokenAuth.validateToken(rawToken), true);
    assert.strictEqual(tokenAuth.validateToken(`Bearer ${rawToken}`), true);
  });

  await t.test("Invalid token fails validation", () => {
    assert.strictEqual(tokenAuth.validateToken("runtime_tok_invalid123"), false);
    assert.strictEqual(tokenAuth.validateToken("wrong_token"), false);
  });

  await t.test("Missing, null, or empty candidate fails validation", () => {
    assert.strictEqual(tokenAuth.validateToken(""), false);
    assert.strictEqual(tokenAuth.validateToken(null), false);
    assert.strictEqual(tokenAuth.validateToken(undefined), false);
    assert.strictEqual(tokenAuth.validateToken(12345), false);
  });

  await t.test("Different length token input is handled safely without throwing", () => {
    assert.strictEqual(tokenAuth.validateToken("a"), false);
    assert.strictEqual(tokenAuth.validateToken("a".repeat(1000)), false);
  });

  await t.test("Token accessors return redacted representation", () => {
    assert.strictEqual(tokenAuth.getMaskedToken(), "[REDACTED]");
    assert.strictEqual(tokenAuth.getToken(), "[REDACTED]");
    assert.strictEqual(tokenAuth.toString().includes(tokenAuth._getRawTokenForTestingOnly()), false);
  });
});
