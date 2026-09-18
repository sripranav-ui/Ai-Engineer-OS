/**
 * @file remoteRepositoryService.js
 * @description High-Level Remote GitHub Repository Domain Service for AI Engineer OS.
 * Operates strictly through githubClient.js transport layer.
 * Performs NO raw fetch(), stores NO credentials, routes NO traffic to native runtime.
 */

import { githubClient } from "./githubClient.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";
import { RUNTIME_ERROR_CODES, createRuntimeError } from "../runtime/runtimeErrors.js";
import { redactSecrets } from "../runtime/runtimeProtocol.js";

export class RemoteRepositoryService {
  /**
   * Validate owner and repository name parameters
   * @param {string} owner
   * @param {string} repo
   * @returns {{ owner: string, repo: string }}
   */
  _validateOwnerRepo(owner, repo) {
    if (!owner || typeof owner !== "string" || !owner.trim()) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Repository owner must be a valid non-empty string",
        "remoteRepository.validateInput"
      );
    }
    if (!repo || typeof repo !== "string" || !repo.trim()) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Repository name must be a valid non-empty string",
        "remoteRepository.validateInput"
      );
    }

    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();

    // Prevent path traversal or URL injection in repository parameters
    if (/[/\\]/.test(cleanOwner) || /[/\\]/.test(cleanRepo) || /^(https?:|file:|data:)/i.test(cleanOwner) || /^(https?:|file:|data:)/i.test(cleanRepo)) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Security boundary violation: Malformed repository owner or repository name parameter",
        "remoteRepository.validateInput"
      );
    }

    return { owner: cleanOwner, repo: cleanRepo };
  }

  /**
   * Validate pagination query options
   * @param {Object} options
   * @returns {{ page: number, perPage: number }}
   */
  _parsePagination(options = {}) {
    let page = Number(options.page || 1);
    let perPage = Number(options.perPage || 30);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(perPage) || perPage < 1) perPage = 30;
    if (perPage > 100) perPage = 100; // Bound maximum page size

    return { page, perPage };
  }

  /**
   * Fetch remote repository metadata
   * @param {string} owner
   * @param {string} repo
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Object>} Normalized repository metadata
   */
  async getRepository(owner, repo, user, options = {}) {
    const valid = this._validateOwnerRepo(owner, repo);
    const endpoint = `/repos/${valid.owner}/${valid.repo}`;

    const res = await githubClient.request(
      endpoint,
      {
        method: "GET",
        requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
        fetchImpl: options.fetchImpl,
      },
      user
    );

    const d = res.data || {};
    return {
      id: d.id || null,
      name: d.name || valid.repo,
      fullName: d.full_name || `${valid.owner}/${valid.repo}`,
      private: Boolean(d.private),
      defaultBranch: d.default_branch || "main",
      description: d.description || "",
      stars: d.stargazers_count || 0,
      forks: d.forks_count || 0,
      openIssuesCount: d.open_issues_count || 0,
      htmlUrl: d.html_url || `https://github.com/${valid.owner}/${valid.repo}`,
      owner: {
        login: d.owner?.login || valid.owner,
        id: d.owner?.id || null,
      },
    };
  }

  /**
   * Fetch remote repository branch list
   * @param {string} owner
   * @param {string} repo
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Array<Object>>} Normalized branches array
   */
  async getBranches(owner, repo, user, options = {}) {
    const valid = this._validateOwnerRepo(owner, repo);
    const pag = this._parsePagination(options);
    const endpoint = `/repos/${valid.owner}/${valid.repo}/branches`;

    const res = await githubClient.request(
      endpoint,
      {
        method: "GET",
        query: { page: pag.page, per_page: pag.perPage },
        requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
        fetchImpl: options.fetchImpl,
      },
      user
    );

    const list = Array.isArray(res.data) ? res.data : [];
    return list.map((b) => ({
      name: b.name,
      protected: Boolean(b.protected),
      commitSha: b.commit?.sha || "",
    }));
  }

  /**
   * Fetch remote repository commits history
   * @param {string} owner
   * @param {string} repo
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Array<Object>>} Normalized commits array
   */
  async getCommits(owner, repo, user, options = {}) {
    const valid = this._validateOwnerRepo(owner, repo);
    const pag = this._parsePagination(options);
    const endpoint = `/repos/${valid.owner}/${valid.repo}/commits`;

    const query = { page: pag.page, per_page: pag.perPage };
    if (options.sha && typeof options.sha === "string") query.sha = options.sha.trim();
    if (options.path && typeof options.path === "string") query.path = options.path.trim();

    const res = await githubClient.request(
      endpoint,
      {
        method: "GET",
        query,
        requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
        fetchImpl: options.fetchImpl,
      },
      user
    );

    const list = Array.isArray(res.data) ? res.data : [];
    return list.map((c) => ({
      sha: c.sha,
      message: redactSecrets(c.commit?.message || ""),
      author: c.commit?.author?.name || c.author?.login || "unknown",
      date: c.commit?.author?.date || c.commit?.committer?.date || "",
      htmlUrl: c.html_url || "",
    }));
  }

  /**
   * Fetch remote repository contents
   * @param {string} owner
   * @param {string} repo
   * @param {string} [path=""]
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Object|Array<Object>>} Normalized content entry or array
   */
  async getContents(owner, repo, path = "", user, options = {}) {
    const valid = this._validateOwnerRepo(owner, repo);
    let cleanPath = String(path || "").trim().replace(/^\/+/, "");

    // Path traversal check
    if (cleanPath.includes("..")) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Path traversal security violation in content path parameter",
        "remoteRepository.getContents"
      );
    }

    const endpoint = cleanPath ? `/repos/${valid.owner}/${valid.repo}/contents/${cleanPath}` : `/repos/${valid.owner}/${valid.repo}/contents`;

    const res = await githubClient.request(
      endpoint,
      {
        method: "GET",
        requiredPermission: PERMISSIONS.READ_REMOTE_REPOSITORY,
        fetchImpl: options.fetchImpl,
      },
      user
    );

    if (Array.isArray(res.data)) {
      return res.data.map((item) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        type: item.type, // "file" | "dir"
        downloadUrl: item.download_url || null,
        htmlUrl: item.html_url || "",
      }));
    }

    const item = res.data || {};
    return {
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      type: item.type,
      downloadUrl: item.download_url || null,
      htmlUrl: item.html_url || "",
    };
  }

  /**
   * Fetch remote repository issues (READ ONLY)
   * @param {string} owner
   * @param {string} repo
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Array<Object>>} Normalized issues array
   */
  async getIssues(owner, repo, user, options = {}) {
    const valid = this._validateOwnerRepo(owner, repo);
    const pag = this._parsePagination(options);
    const endpoint = `/repos/${valid.owner}/${valid.repo}/issues`;

    const query = {
      state: options.state === "closed" || options.state === "all" ? options.state : "open",
      page: pag.page,
      per_page: pag.perPage,
      sort: options.sort || "created",
      direction: options.direction === "asc" ? "asc" : "desc",
    };

    const res = await githubClient.request(
      endpoint,
      {
        method: "GET",
        query,
        requiredPermission: PERMISSIONS.READ_GITHUB_ISSUES,
        fetchImpl: options.fetchImpl,
      },
      user
    );

    const list = Array.isArray(res.data) ? res.data : [];
    // Filter out pull requests since GitHub API /issues endpoint returns both issues and PRs
    return list
      .filter((item) => !item.pull_request)
      .map((item) => ({
        number: item.number,
        title: redactSecrets(item.title || ""),
        body: redactSecrets(item.body || ""),
        state: item.state,
        author: item.user?.login || "unknown",
        labels: (item.labels || []).map((l) => (typeof l === "object" ? l.name : String(l))),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        htmlUrl: item.html_url || "",
      }));
  }

  /**
   * Fetch remote repository pull requests list (READ ONLY)
   * @param {string} owner
   * @param {string} repo
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Array<Object>>} Normalized PRs array
   */
  async getPullRequests(owner, repo, user, options = {}) {
    const valid = this._validateOwnerRepo(owner, repo);
    const pag = this._parsePagination(options);
    const endpoint = `/repos/${valid.owner}/${valid.repo}/pulls`;

    const query = {
      state: options.state === "closed" || options.state === "all" ? options.state : "open",
      page: pag.page,
      per_page: pag.perPage,
      sort: options.sort || "created",
      direction: options.direction === "asc" ? "asc" : "desc",
    };

    if (options.base && typeof options.base === "string") query.base = options.base.trim();
    if (options.head && typeof options.head === "string") query.head = options.head.trim();

    const res = await githubClient.request(
      endpoint,
      {
        method: "GET",
        query,
        requiredPermission: PERMISSIONS.READ_GITHUB_PULL_REQUESTS,
        fetchImpl: options.fetchImpl,
      },
      user
    );

    const list = Array.isArray(res.data) ? res.data : [];
    return list.map((pr) => ({
      number: pr.number,
      title: redactSecrets(pr.title || ""),
      body: redactSecrets(pr.body || ""),
      state: pr.state,
      author: pr.user?.login || "unknown",
      sourceBranch: pr.head?.ref || "",
      targetBranch: pr.base?.ref || "",
      draft: Boolean(pr.draft),
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      htmlUrl: pr.html_url || "",
    }));
  }

  /**
   * Fetch specific remote pull request details (READ ONLY)
   * @param {string} owner
   * @param {string} repo
   * @param {number|string} pullNumber
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Object>} Normalized PR details
   */
  async getPullRequest(owner, repo, pullNumber, user, options = {}) {
    const valid = this._validateOwnerRepo(owner, repo);
    const num = Number(pullNumber);
    if (isNaN(num) || num < 1) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        "Pull request number must be a valid positive number",
        "remoteRepository.getPullRequest"
      );
    }

    const endpoint = `/repos/${valid.owner}/${valid.repo}/pulls/${num}`;

    const res = await githubClient.request(
      endpoint,
      {
        method: "GET",
        requiredPermission: PERMISSIONS.READ_GITHUB_PULL_REQUESTS,
        fetchImpl: options.fetchImpl,
      },
      user
    );

    const pr = res.data || {};
    return {
      number: pr.number || num,
      title: redactSecrets(pr.title || ""),
      body: redactSecrets(pr.body || ""),
      state: pr.state || "open",
      author: pr.user?.login || "unknown",
      sourceBranch: pr.head?.ref || "",
      targetBranch: pr.base?.ref || "",
      draft: Boolean(pr.draft),
      mergeable: pr.mergeable !== undefined ? pr.mergeable : null,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changed_files || 0,
      createdAt: pr.created_at || "",
      updatedAt: pr.updated_at || "",
      htmlUrl: pr.html_url || "",
    };
  }
}

export const remoteRepositoryService = new RemoteRepositoryService();
export default remoteRepositoryService;
