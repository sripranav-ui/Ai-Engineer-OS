/**
 * @file remoteRepositoryService.test.js
 * @description Unit tests for Step 5.4 Remote GitHub Repository Service.
 * All githubClient requests are strictly mocked using test fetch implementations.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { remoteRepositoryService } from "./remoteRepositoryService.js";
import { githubAuthService } from "./githubAuthService.js";
import { DEV_IDENTITIES } from "../auth/authService.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";

const TEST_TOKEN = "ghp_TEST_REMOTE_REPO_SERVICE_PAT_9999";

const mockAuthSuccess = async () => ({
  ok: true,
  status: 200,
  json: async () => ({ login: "testowner", id: 101 }),
});

describe("RemoteRepositoryService — Input Validation & Parameter Safety", () => {
  const user = DEV_IDENTITIES.USER;

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(TEST_TOKEN, user, { fetchImpl: mockAuthSuccess });
  });

  it("should REJECT empty or invalid owner/repo parameters", async () => {
    await assert.rejects(
      async () => {
        await remoteRepositoryService.getRepository("", "repo", user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );

    await assert.rejects(
      async () => {
        await remoteRepositoryService.getRepository("owner", "   ", user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );
  });

  it("should REJECT malformed repository names containing slashes or URL prefixes (prevent injection)", async () => {
    await assert.rejects(
      async () => {
        await remoteRepositoryService.getRepository("owner/sub", "repo", user);
      },
      (err) => err.code === "INVALID_REQUEST" && err.message.includes("Security boundary violation")
    );

    await assert.rejects(
      async () => {
        await remoteRepositoryService.getRepository("https://evil.com", "repo", user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );
  });

  it("should REJECT path traversal attempts in getContents()", async () => {
    await assert.rejects(
      async () => {
        await remoteRepositoryService.getContents("owner", "repo", "../../etc/passwd", user);
      },
      (err) => err.code === "INVALID_REQUEST" && err.message.includes("Path traversal")
    );
  });

  it("should REJECT invalid pull request number in getPullRequest()", async () => {
    await assert.rejects(
      async () => {
        await remoteRepositoryService.getPullRequest("owner", "repo", -5, user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );

    await assert.rejects(
      async () => {
        await remoteRepositoryService.getPullRequest("owner", "repo", "invalid_num", user);
      },
      (err) => err.code === "INVALID_REQUEST"
    );
  });
});

describe("RemoteRepositoryService — Authorization Gate", () => {
  const user = DEV_IDENTITIES.USER;
  const unprivilegedUser = { id: "u_none", role: "USER", permissions: [] };

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(TEST_TOKEN, user, { fetchImpl: mockAuthSuccess });
  });

  it("should REJECT getRepository if user lacks READ_REMOTE_REPOSITORY permission", async () => {
    await assert.rejects(
      async () => {
        await remoteRepositoryService.getRepository("owner", "repo", unprivilegedUser);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT getIssues if user lacks READ_GITHUB_ISSUES permission", async () => {
    await assert.rejects(
      async () => {
        await remoteRepositoryService.getIssues("owner", "repo", unprivilegedUser);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });

  it("should REJECT getPullRequests if user lacks READ_GITHUB_PULL_REQUESTS permission", async () => {
    await assert.rejects(
      async () => {
        await remoteRepositoryService.getPullRequests("owner", "repo", unprivilegedUser);
      },
      (err) => err.code === "AUTHORIZATION_FAILURE"
    );
  });
});

describe("RemoteRepositoryService — High-Level Domain Operations (Mocked Transport)", () => {
  const user = DEV_IDENTITIES.USER;

  beforeEach(async () => {
    githubAuthService.disconnect();
    await githubAuthService.connect(TEST_TOKEN, user, { fetchImpl: mockAuthSuccess });
  });

  it("should fetch and normalize repository metadata", async () => {
    const mockFetchRepo = async (url) => {
      assert.ok(url.includes("/repos/owner/myrepo"));
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({
          id: 777,
          name: "myrepo",
          full_name: "owner/myrepo",
          private: false,
          default_branch: "main",
          description: "Sample AI repo",
          stargazers_count: 42,
          forks_count: 5,
          open_issues_count: 3,
          html_url: "https://github.com/owner/myrepo",
          owner: { login: "owner", id: 101 },
        }),
      };
    };

    const repo = await remoteRepositoryService.getRepository("owner", "myrepo", user, { fetchImpl: mockFetchRepo });
    assert.equal(repo.id, 777);
    assert.equal(repo.name, "myrepo");
    assert.equal(repo.fullName, "owner/myrepo");
    assert.equal(repo.stars, 42);
    assert.equal(repo.owner.login, "owner");
  });

  it("should fetch and normalize branches list", async () => {
    const mockFetchBranches = async (url) => {
      assert.ok(url.includes("/repos/owner/myrepo/branches"));
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => [
          { name: "main", protected: true, commit: { sha: "abc1234" } },
          { name: "dev", protected: false, commit: { sha: "def5678" } },
        ],
      };
    };

    const branches = await remoteRepositoryService.getBranches("owner", "myrepo", user, { fetchImpl: mockFetchBranches });
    assert.equal(branches.length, 2);
    assert.equal(branches[0].name, "main");
    assert.equal(branches[0].protected, true);
    assert.equal(branches[1].name, "dev");
  });

  it("should fetch and normalize commits history", async () => {
    const mockFetchCommits = async (url) => {
      assert.ok(url.includes("/repos/owner/myrepo/commits"));
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => [
          {
            sha: "c1",
            commit: { message: "Initial commit", author: { name: "Alice", date: "2026-09-01T00:00:00Z" } },
            html_url: "https://github.com/owner/myrepo/commit/c1",
          },
        ],
      };
    };

    const commits = await remoteRepositoryService.getCommits("owner", "myrepo", user, { fetchImpl: mockFetchCommits });
    assert.equal(commits.length, 1);
    assert.equal(commits[0].sha, "c1");
    assert.equal(commits[0].author, "Alice");
  });

  it("should fetch and normalize repository contents", async () => {
    const mockFetchContents = async (url) => {
      assert.ok(url.includes("/repos/owner/myrepo/contents/src"));
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => [
          { name: "App.jsx", path: "src/App.jsx", sha: "f1", size: 1024, type: "file" },
        ],
      };
    };

    const contents = await remoteRepositoryService.getContents("owner", "myrepo", "src", user, { fetchImpl: mockFetchContents });
    assert.ok(Array.isArray(contents));
    assert.equal(contents[0].name, "App.jsx");
    assert.equal(contents[0].type, "file");
  });

  it("should fetch and normalize issues (filtering out pull requests)", async () => {
    const mockFetchIssues = async (url) => {
      assert.ok(url.includes("/repos/owner/myrepo/issues"));
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => [
          { number: 1, title: "Bug report", body: "Issue body", state: "open", user: { login: "reporter" }, labels: ["bug"] },
          { number: 2, title: "PR title", body: "PR body", state: "open", pull_request: { url: "..." } }, // should be filtered
        ],
      };
    };

    const issues = await remoteRepositoryService.getIssues("owner", "myrepo", user, { fetchImpl: mockFetchIssues });
    assert.equal(issues.length, 1);
    assert.equal(issues[0].number, 1);
    assert.equal(issues[0].title, "Bug report");
  });

  it("should fetch and normalize pull requests list", async () => {
    const mockFetchPRs = async (url) => {
      assert.ok(url.includes("/repos/owner/myrepo/pulls"));
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => [
          {
            number: 10,
            title: "Feature PR",
            body: "PR summary",
            state: "open",
            user: { login: "author1" },
            head: { ref: "feature-branch" },
            base: { ref: "main" },
            draft: false,
          },
        ],
      };
    };

    const prs = await remoteRepositoryService.getPullRequests("owner", "myrepo", user, { fetchImpl: mockFetchPRs });
    assert.equal(prs.length, 1);
    assert.equal(prs[0].number, 10);
    assert.equal(prs[0].sourceBranch, "feature-branch");
    assert.equal(prs[0].targetBranch, "main");
  });

  it("should fetch specific pull request details", async () => {
    const mockFetchPR = async (url) => {
      assert.ok(url.includes("/repos/owner/myrepo/pulls/10"));
      return {
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({
          number: 10,
          title: "Feature PR",
          body: "PR details body",
          state: "open",
          user: { login: "author1" },
          head: { ref: "feature-branch" },
          base: { ref: "main" },
          draft: false,
          mergeable: true,
          additions: 50,
          deletions: 10,
          changed_files: 3,
        }),
      };
    };

    const pr = await remoteRepositoryService.getPullRequest("owner", "myrepo", 10, user, { fetchImpl: mockFetchPR });
    assert.equal(pr.number, 10);
    assert.equal(pr.mergeable, true);
    assert.equal(pr.additions, 50);
    assert.equal(pr.deletions, 10);
    assert.equal(pr.changedFiles, 3);
  });
});

describe("RemoteRepositoryService — Structural Security & Read-Only Constraints", () => {
  it("should NOT expose any destructive mutation methods (push, commit, createPR, merge)", () => {
    assert.equal(typeof remoteRepositoryService.push, "undefined");
    assert.equal(typeof remoteRepositoryService.commit, "undefined");
    assert.equal(typeof remoteRepositoryService.createPullRequest, "undefined");
    assert.equal(typeof remoteRepositoryService.mergePullRequest, "undefined");
  });
});
