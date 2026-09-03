/**
 * @file githubService.js
 * @description Secure GitHub Integration Service for AI Engineer OS V1.6.
 * Manages GitHub API interactions using strictly in-memory session token storage.
 * Tokens are NEVER stored in localStorage, sessionStorage, cookies, IndexedDB, or logs.
 */

class GithubService {
  constructor() {
    /** @private Strictly in-memory session token */
    this._token = null;
    this.currentRepo = { owner: "sripranav-ui", repo: "AI-Engineer-OS" };
  }

  /**
   * Set GitHub Personal Access Token in session memory
   * @param {string|null} token
   */
  setToken(token) {
    if (!token || typeof token !== "string" || !token.trim()) {
      this._token = null;
    } else {
      this._token = token.trim();
    }
  }

  /** Clear token from memory */
  clearToken() {
    this._token = null;
  }

  /** Check if authenticated in active memory */
  isAuthenticated() {
    return Boolean(this._token);
  }

  /**
   * Get safe connection status for display
   * @returns {{ connected: boolean, tokenMask: string, repo: Object }}
   */
  getStatus() {
    return {
      connected: this.isAuthenticated(),
      tokenMask: this.isAuthenticated() ? "[REDACTED]" : "Not Connected",
      repo: this.currentRepo,
    };
  }

  /** Helper for GitHub REST API calls */
  async _fetch(endpoint, options = {}) {
    if (!this._token) {
      throw new Error("GitHub integration unavailable: No active session token set in memory.");
    }

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${this._token}`,
      ...(options.headers || {}),
    };

    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = `GitHub API Error (${response.status})`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.message) msg += `: ${errJson.message}`;
      } catch {
        // fallback
      }
      throw new Error(msg);
    }

    return await response.json();
  }

  /** Fetch repository information */
  async getRepoInfo(owner = this.currentRepo.owner, repo = this.currentRepo.repo) {
    if (!this._token) return this._getLocalRepoFallback(owner, repo);
    try {
      const data = await this._fetch(`/repos/${owner}/${repo}`);
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        defaultBranch: data.default_branch,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssuesCount: data.open_issues_count,
        htmlUrl: data.html_url,
      };
    } catch {
      return this._getLocalRepoFallback(owner, repo);
    }
  }

  /** Fetch branches list */
  async getBranches(owner = this.currentRepo.owner, repo = this.currentRepo.repo) {
    if (!this._token) return ["main", "feature/ai-engineer-os-health-endpoint"];
    try {
      const branches = await this._fetch(`/repos/${owner}/${repo}/branches`);
      return branches.map((b) => b.name);
    } catch {
      return ["main", "feature/ai-engineer-os-health-endpoint"];
    }
  }

  /** Fetch open issues */
  async getIssues(owner = this.currentRepo.owner, repo = this.currentRepo.repo) {
    if (!this._token) return this._getMockIssues();
    try {
      const issues = await this._fetch(`/repos/${owner}/${repo}/issues?state=open`);
      return issues
        .filter((i) => !i.pull_request)
        .map((i) => ({
          number: i.number,
          title: i.title,
          body: i.body || "",
          state: i.state,
          user: i.user?.login || "unknown",
          labels: (i.labels || []).map((l) => l.name),
          createdAt: i.created_at,
          htmlUrl: i.html_url,
        }));
    } catch {
      return this._getMockIssues();
    }
  }

  /** Fetch specific issue details */
  async getIssue(issueNumber, owner = this.currentRepo.owner, repo = this.currentRepo.repo) {
    if (!this._token) {
      const mocks = this._getMockIssues();
      return mocks.find((i) => i.number === Number(issueNumber)) || mocks[0];
    }
    try {
      const i = await this._fetch(`/repos/${owner}/${repo}/issues/${issueNumber}`);
      return {
        number: i.number,
        title: i.title,
        body: i.body || "",
        state: i.state,
        user: i.user?.login || "unknown",
        labels: (i.labels || []).map((l) => l.name),
        createdAt: i.created_at,
        htmlUrl: i.html_url,
      };
    } catch {
      const mocks = this._getMockIssues();
      return mocks.find((i) => i.number === Number(issueNumber)) || mocks[0];
    }
  }

  /** Create Pull Request */
  async createPullRequest(prData, owner = this.currentRepo.owner, repo = this.currentRepo.repo) {
    if (!this._token) {
      return {
        success: true,
        isSimulated: true,
        number: 42,
        htmlUrl: `https://github.com/${owner}/${repo}/pull/42`,
        title: prData.title,
        message: "[Browser Mode / Unauthenticated] PR template created. Authenticate in settings to submit directly to GitHub.",
      };
    }

    const payload = {
      title: prData.title,
      body: prData.body,
      head: prData.head,
      base: prData.base || "main",
    };

    const res = await this._fetch(`/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      number: res.number,
      htmlUrl: res.html_url,
      title: res.title,
    };
  }

  /** Local repository fallback data */
  _getLocalRepoFallback(owner, repo) {
    return {
      name: repo,
      fullName: `${owner}/${repo}`,
      description: "AI Engineer OS local repository instance",
      defaultBranch: "main",
      stars: 128,
      forks: 14,
      openIssuesCount: 3,
      htmlUrl: `https://github.com/${owner}/${repo}`,
    };
  }

  /** Mock issues for local testing & fallback */
  _getMockIssues() {
    return [
      {
        number: 101,
        title: "Add a /health endpoint and automated test",
        body: "Create a native GET /health status check on the local runtime daemon returning system capabilities, version 1.6.0, and write an automated node --test runner.",
        state: "open",
        user: "lead-engineer",
        labels: ["feature", "backend", "v1.6"],
        createdAt: new Date().toISOString(),
      },
      {
        number: 102,
        title: "Add dark mode persistence to the settings page",
        body: "Ensure dark mode user preference persists across page reloads in local state.",
        state: "open",
        user: "ui-team",
        labels: ["enhancement", "ui"],
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

export const githubService = new GithubService();
export default githubService;
