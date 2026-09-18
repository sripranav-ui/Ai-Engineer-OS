/**
 * @file githubAuthService.test.js
 * @description Unit tests for Step 5.2 GitHub Authentication & Credential Security Service.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { githubAuthService } from "./githubAuthService.js";
import { DEV_IDENTITIES } from "../auth/authService.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";

describe("GithubAuthService — Input Validation", () => {
  const user = DEV_IDENTITIES.USER;

  beforeEach(() => {
    githubAuthService.disconnect();
  });

  it("should REJECT empty, null, or undefined token", async () => {
    await assert.rejects(
      async () => {
        await githubAuthService.connect("", user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );

    await assert.rejects(
      async () => {
        await githubAuthService.connect(null, user);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE" || err.code === "INVALID_REQUEST"
    );

    await assert.rejects(
      async () => {
        await githubAuthService.connect("   ", user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );
  });

  it("should REJECT non-string or short credentials", async () => {
    await assert.rejects(
      async () => {
        await githubAuthService.connect(12345678, user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );

    await assert.rejects(
      async () => {
        await githubAuthService.connect("short", user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );
  });
});

describe("GithubAuthService — Authorization Enforcement", () => {
  beforeEach(() => {
    githubAuthService.disconnect();
  });

  it("should REJECT connect attempt if user identity is missing or null", async () => {
    await assert.rejects(
      async () => {
        await githubAuthService.connect("ghp_valid_format_token_12345", null);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT connect attempt if user lacks PERMISSIONS.CONNECT_GITHUB", async () => {
    const unprivilegedUser = { id: "u_none", role: "USER", permissions: [] };
    await assert.rejects(
      async () => {
        await githubAuthService.connect("ghp_valid_format_token_12345", unprivilegedUser);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });
});

describe("GithubAuthService — Successful Authentication (Mocked Fetch)", () => {
  const user = DEV_IDENTITIES.USER;

  const mockFetchSuccess = async (url, options) => {
    assert.equal(url, "https://api.github.com/user");
    assert.ok(options.headers.Authorization.startsWith("token ghp_"));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        login: "octocat",
        id: 583231,
        name: "The Octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
        html_url: "https://github.com/octocat",
      }),
    };
  };

  beforeEach(() => {
    githubAuthService.disconnect();
  });

  it("should validate token, store in-memory PAT, and expose safe metadata", async () => {
    const testToken = "ghp_TEST_VALID_PAT_TOKEN_1234567890";
    const res = await githubAuthService.connect(testToken, user, { fetchImpl: mockFetchSuccess });

    assert.equal(res.success, true);
    assert.equal(res.authenticated, true);
    assert.equal(res.githubUser.login, "octocat");

    assert.equal(githubAuthService.isAuthenticated(), true);
    const status = githubAuthService.getStatus();
    assert.equal(status.authenticated, true);
    assert.equal(status.tokenPresent, true);
    assert.ok(status.tokenMask.includes("ghp_"));
    assert.equal(status.tokenMask.includes(testToken), false); // NEVER expose raw PAT
    assert.equal(githubAuthService.getToken(), testToken); // Trusted getter
  });
});

describe("GithubAuthService — Failed Authentication (Mocked Error Responses)", () => {
  const user = DEV_IDENTITIES.USER;

  const mockFetch401 = async () => ({
    ok: false,
    status: 401,
    text: async () => "Bad credentials",
  });

  const mockFetchTimeout = async () => {
    const err = new Error("Request aborted");
    err.name = "AbortError";
    throw err;
  };

  beforeEach(() => {
    githubAuthService.disconnect();
  });

  it("should handle HTTP 401 Bad Credentials gracefully without leaking token", async () => {
    const invalidToken = "ghp_INVALID_EXPIRED_PAT_TOKEN_123456";

    await assert.rejects(
      async () => {
        await githubAuthService.connect(invalidToken, user, { fetchImpl: mockFetch401 });
      },
      (err) => err.code === "AUTHENTICATION_FAILURE" && err.message.includes("invalid or expired")
    );

    assert.equal(githubAuthService.isAuthenticated(), false);
    assert.equal(githubAuthService.getToken(), null);
  });

  it("should handle timeout error cleanly", async () => {
    const token = "ghp_VALID_FORMAT_TOKEN_TIMEOUT_TEST";

    await assert.rejects(
      async () => {
        await githubAuthService.connect(token, user, { fetchImpl: mockFetchTimeout });
      },
      (err) => err.code === "TIMEOUT" && err.message.includes("timed out")
    );

    assert.equal(githubAuthService.isAuthenticated(), false);
  });
});

describe("GithubAuthService — Single Active Session & Token Lifecycle", () => {
  const user = DEV_IDENTITIES.USER;

  const mockFetchUserA = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ login: "userA", id: 101 }),
  });

  const mockFetchUserB = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ login: "userB", id: 202 }),
  });

  beforeEach(() => {
    githubAuthService.disconnect();
  });

  it("should overwrite tokenA when tokenB connects (single active session)", async () => {
    const tokenA = "ghp_TOKEN_USER_A_1234567890";
    const tokenB = "ghp_TOKEN_USER_B_9876543210";

    await githubAuthService.connect(tokenA, user, { fetchImpl: mockFetchUserA });
    assert.equal(githubAuthService.getToken(), tokenA);
    assert.equal(githubAuthService.getStatus().githubUser.login, "userA");

    await githubAuthService.connect(tokenB, user, { fetchImpl: mockFetchUserB });
    assert.equal(githubAuthService.getToken(), tokenB);
    assert.equal(githubAuthService.getStatus().githubUser.login, "userB");
    assert.equal(githubAuthService.getToken() === tokenA, false);
  });

  it("should clear token and user metadata on disconnect()", async () => {
    const token = "ghp_TOKEN_TO_DISCONNECT_123456";
    await githubAuthService.connect(token, user, { fetchImpl: mockFetchUserA });
    assert.equal(githubAuthService.isAuthenticated(), true);

    const dcRes = githubAuthService.disconnect(user);
    assert.equal(dcRes.success, true);
    assert.equal(dcRes.authenticated, false);

    assert.equal(githubAuthService.isAuthenticated(), false);
    assert.equal(githubAuthService.getToken(), null);
    assert.equal(githubAuthService.getStatus().githubUser, null);
  });
});

describe("GithubAuthService — Secret Leakage Security Verification", () => {
  const user = DEV_IDENTITIES.USER;
  const SECRET_PAT = "ghp_SECRET_PAT_DO_NOT_LEAK_999999999";

  const mockFetchFailWithSecret = async () => {
    const err = new Error(`Connection error with header token ${SECRET_PAT}`);
    throw err;
  };

  const mockFetchSuccess = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ login: "secureUser", id: 999 }),
  });

  beforeEach(() => {
    githubAuthService.disconnect();
  });

  it("should NEVER leak raw PAT in getStatus(), errors, or JSON serialization", async () => {
    // 1. Check getStatus()
    await githubAuthService.connect(SECRET_PAT, user, { fetchImpl: mockFetchSuccess });
    const status = githubAuthService.getStatus();
    const statusJson = JSON.stringify(status);

    assert.equal(statusJson.includes(SECRET_PAT), false);
    assert.equal(status.tokenMask.includes(SECRET_PAT), false);

    // 2. Check error handling sanitization
    githubAuthService.disconnect();
    try {
      await githubAuthService.connect(SECRET_PAT, user, { fetchImpl: mockFetchFailWithSecret });
      assert.fail("Should have thrown runtime error");
    } catch (err) {
      assert.equal(err.message.includes(SECRET_PAT), false);
      assert.equal(JSON.stringify(err).includes(SECRET_PAT), false);
    }
  });
});
