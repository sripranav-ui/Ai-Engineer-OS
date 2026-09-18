/**
 * @file githubClient.test.js
 * @description Unit tests for Step 5.3 GitHub REST API Client & Transport Layer.
 * All network calls are strictly mocked.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { githubClient } from "./githubClient.js";
import { githubAuthService } from "./githubAuthService.js";
import { DEV_IDENTITIES } from "../auth/authService.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";

const TEST_TOKEN = "ghp_TEST_CLIENT_PAT_TOKEN_1234567890";

const mockAuthSuccess = async () => ({
  ok: true,
  status: 200,
  json: async () => ({ login: "testuser", id: 100 }),
});

describe("GithubClient — Authorization & Authentication Gate", () => {
  const user = DEV_IDENTITIES.USER;

  beforeEach(() => {
    githubAuthService.disconnect();
  });

  it("should REJECT request if user identity is missing or null", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request("/user", { requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY }, null);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT request if requiredPermission is missing", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request("/user", {}, user);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT request if user lacks required capability permission", async () => {
    const unprivilegedUser = { id: "u_none", role: "USER", permissions: [] };
    await assert.rejects(
      async () => {
        await githubClient.request(
          "/user",
          { requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY },
          unprivilegedUser
        );
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT request if githubAuthService is not connected", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request(
          "/user",
          { requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY },
          user
        );
      },
      (err) => err.code === "AUTHENTICATION_FAILURE" && err.message.includes("not connected")
    );
  });
});

describe("GithubClient — Endpoint Safety & Boundary Protection", () => {
  const user = DEV_IDENTITIES.USER;

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(TEST_TOKEN, user, { fetchImpl: mockAuthSuccess });
  });

  it("should REJECT non-relative endpoints or missing leading '/'", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request("user", { requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY }, user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );
  });

  it("should REJECT external URL endpoints (prevent SSRF host redirection)", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request(
          "https://evil.example.com/api",
          { requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY },
          user
        );
      },
      (err) => err.code === "INVALID_REQUEST" && err.message.includes("Security boundary violation")
    );

    await assert.rejects(
      async () => {
        await githubClient.request(
          "file:///etc/passwd",
          { requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY },
          user
        );
      },
      (err) => err.code === "INVALID_REQUEST"
    );
  });
});

describe("GithubClient — Successful Transport & Rate Limits (Mocked Fetch)", () => {
  const user = DEV_IDENTITIES.USER;

  const mockFetchRepo = async (url, options) => {
    assert.ok(url.startsWith("https://api.github.com/repos/owner/repo"));
    assert.equal(options.headers.Authorization, `token ${TEST_TOKEN}`);

    const headers = new Map([
      ["content-type", "application/json"],
      ["x-ratelimit-limit", "5000"],
      ["x-ratelimit-remaining", "4995"],
      ["x-ratelimit-reset", "1700000000"],
    ]);

    return {
      ok: true,
      status: 200,
      headers,
      json: async () => ({ id: 99, name: "repo", full_name: "owner/repo" }),
    };
  };

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(TEST_TOKEN, user, { fetchImpl: mockAuthSuccess });
  });

  it("should execute authenticated GET request and parse rate limits", async () => {
    const res = await githubClient.request(
      "/repos/owner/repo",
      {
        requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
        fetchImpl: mockFetchRepo,
      },
      user
    );

    assert.equal(res.status, 200);
    assert.equal(res.data.name, "repo");
    assert.equal(res.rateLimit.limit, 5000);
    assert.equal(res.rateLimit.remaining, 4995);
    assert.ok(res.rateLimit.resetAt);

    // Verify token is NOT exposed in response object
    assert.equal(JSON.stringify(res).includes(TEST_TOKEN), false);
  });
});

describe("GithubClient — HTTP Error Code Mapping", () => {
  const user = DEV_IDENTITIES.USER;

  const createMockErrorFetch = (status, text) => async () => ({
    ok: false,
    status,
    headers: new Map([["content-type", "text/plain"]]),
    text: async () => text,
  });

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(TEST_TOKEN, user, { fetchImpl: mockAuthSuccess });
  });

  it("should map 401 Bad Credentials to AUTHENTICATION_FAILURE", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request(
          "/user",
          {
            requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
            fetchImpl: createMockErrorFetch(401, "Bad credentials"),
          },
          user
        );
      },
      (err) => err.code === "AUTHENTICATION_FAILURE" && err.message.includes("401")
    );
  });

  it("should map 403 Forbidden / Rate Limit to COMMAND_BLOCKED", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request(
          "/user",
          {
            requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
            fetchImpl: createMockErrorFetch(403, "API rate limit exceeded"),
          },
          user
        );
      },
      (err) => err.code === "COMMAND_BLOCKED"
    );
  });

  it("should map 404 Not Found to INVALID_REQUEST", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request(
          "/repos/owner/unknown",
          {
            requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
            fetchImpl: createMockErrorFetch(404, "Not Found"),
          },
          user
        );
      },
      (err) => err.code === "INVALID_REQUEST" && err.message.includes("404")
    );
  });

  it("should map 422 Validation Failed to INVALID_REQUEST", async () => {
    await assert.rejects(
      async () => {
        await githubClient.request(
          "/repos/owner/repo/comments",
          {
            requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
            fetchImpl: createMockErrorFetch(422, "Validation Failed"),
          },
          user
        );
      },
      (err) => err.code === "INVALID_REQUEST" && err.message.includes("422")
    );
  });
});

describe("GithubClient — Bounded Conservative Retries", () => {
  const user = DEV_IDENTITIES.USER;

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(TEST_TOKEN, user, { fetchImpl: mockAuthSuccess });
  });

  it("should retry transient 502 error and succeed on second attempt", async () => {
    let attempts = 0;
    const mockTransientFetch = async () => {
      attempts++;
      if (attempts === 1) {
        return {
          ok: false,
          status: 502,
          headers: new Map(),
          text: async () => "Bad Gateway",
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        json: async () => ({ success: true }),
      };
    };

    const res = await githubClient.request(
      "/user",
      {
        requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
        fetchImpl: mockTransientFetch,
      },
      user
    );

    assert.equal(res.status, 200);
    assert.equal(attempts, 2);
  });

  it("should NOT retry 401 or 404 client errors", async () => {
    let attempts = 0;
    const mock404Fetch = async () => {
      attempts++;
      return {
        ok: false,
        status: 404,
        headers: new Map(),
        text: async () => "Not Found",
      };
    };

    await assert.rejects(
      async () => {
        await githubClient.request(
          "/user",
          {
            requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
            fetchImpl: mock404Fetch,
          },
          user
        );
      },
      (err) => err.code === "INVALID_REQUEST"
    );

    assert.equal(attempts, 1);
  });
});

describe("GithubClient — Secret Leakage Security Verification", () => {
  const user = DEV_IDENTITIES.USER;
  const SECRET_PAT = "ghp_SECRET_PAT_DO_NOT_LEAK_CLIENT_999";

  const mockFailWithSecretInBody = async () => ({
    ok: false,
    status: 400,
    headers: new Map(),
    text: async () => `Error containing raw secret ${SECRET_PAT}`,
  });

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(SECRET_PAT, user, { fetchImpl: mockAuthSuccess });
  });

  it("should NEVER expose raw PAT in thrown errors or audit event payloads", async () => {
    try {
      await githubClient.request(
        "/user",
        {
          requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
          fetchImpl: mockFailWithSecretInBody,
        },
        user
      );
      assert.fail("Should have thrown error");
    } catch (err) {
      assert.equal(err.message.includes(SECRET_PAT), false);
      assert.equal(JSON.stringify(err).includes(SECRET_PAT), false);
    }
  });
});
