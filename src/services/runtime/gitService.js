/**
 * @file gitService.js
 * @description Secure Local Git Inspection Abstraction for AI Engineer OS.
 * All Git operations pass through authorization (PERMISSIONS.READ_REPOSITORY),
 * runtime client, native daemon Command Policy / Workspace Guard, and audit logger.
 */

import runtimeClient from "./runtimeClient.js";
import { STRUCTURED_OPERATIONS } from "./runtimeProtocol.js";
import { RUNTIME_ERROR_CODES, createRuntimeError } from "./runtimeErrors.js";

export class GitService {
  /**
   * Check if workspace is a Git repository
   * @param {Object} user
   * @returns {Promise<boolean>}
   */
  async isRepository(user) {
    try {
      const response = await runtimeClient.request(
        STRUCTURED_OPERATIONS.GIT_IS_REPO,
        {},
        user
      );
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Get workspace Git status
   * @param {Object} user
   * @returns {Promise<{ success: boolean, status: string, files: Array }>}
   */
  async getStatus(user) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_STATUS,
      {},
      user
    );

    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.GIT_FAILURE,
        response.error?.message || "Failed to query Git status",
        "git.status"
      );
    }

    return {
      success: true,
      status: response.data?.output || "Clean working tree",
      files: response.data?.result?.files || [],
    };
  }

  /**
   * Get workspace Git diff
   * @param {Object} user
   * @returns {Promise<{ success: boolean, diff: string }>}
   */
  async getDiff(user) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_DIFF,
      {},
      user
    );

    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.GIT_FAILURE,
        response.error?.message || "Failed to query Git diff",
        "git.diff"
      );
    }

    return {
      success: true,
      diff: response.data?.output || "",
    };
  }

  /**
   * Get list of local Git branches
   * @param {Object} user
   * @returns {Promise<{ success: boolean, branches: Array<string> }>}
   */
  async getBranches(user) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_BRANCHES,
      {},
      user
    );

    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.GIT_FAILURE,
        response.error?.message || "Failed to list Git branches",
        "git.branches"
      );
    }

    return {
      success: true,
      branches: response.data?.result?.branches || ["main"],
    };
  }

  /**
   * Get current active Git branch
   * @param {Object} user
   * @returns {Promise<string>}
   */
  async getCurrentBranch(user) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_CURRENT_BRANCH,
      {},
      user
    );

    if (!response.success) {
      return "main";
    }

    return response.data?.result?.currentBranch || "main";
  }

  /**
   * Get commit log history
   * @param {number} [limit=10]
   * @param {Object} user
   * @returns {Promise<{ success: boolean, log: string, commits: Array }>}
   */
  async getLog(limit = 10, user) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_LOG,
      { limit },
      user
    );

    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.GIT_FAILURE,
        response.error?.message || "Failed to query Git log",
        "git.log"
      );
    }

    return {
      success: true,
      log: response.data?.output || "",
      commits: response.data?.result?.commits || [],
    };
  }

  /**
   * Create a new local Git branch safely
   * @param {string} branchName
   * @param {Object} user
   * @returns {Promise<{ success: boolean, branchName: string, output: string }>}
   */
  async createBranch(branchName, user) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_CREATE_BRANCH,
      { branchName },
      user
    );

    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.GIT_FAILURE,
        response.error?.message || `Failed to create branch '${branchName}'`,
        "git.create_branch",
        { branchName }
      );
    }

    return {
      success: true,
      branchName: response.data?.result?.branchName || branchName,
      output: response.data?.output || `Branch '${branchName}' created`,
    };
  }

  /**
   * Switch active Git branch safely
   * @param {string} targetBranch
   * @param {Object} user
   * @returns {Promise<{ success: boolean, branchName: string, output: string }>}
   */
  async switchBranch(targetBranch, user) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_CHECKOUT_BRANCH,
      { branchName: targetBranch },
      user
    );

    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.GIT_FAILURE,
        response.error?.message || `Failed to switch to branch '${targetBranch}'`,
        "git.checkout_branch",
        { targetBranch }
      );
    }

    return {
      success: true,
      branchName: response.data?.result?.branchName || targetBranch,
      output: response.data?.output || `Switched to branch '${targetBranch}'`,
    };
  }

  /**
   * Execute a structured Git commit
   * @param {string} commitMessage
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<{ success: boolean, hash: string, message: string, output: string }>}
   */
  async commit(commitMessage, user, options = {}) {
    const response = await runtimeClient.request(
      STRUCTURED_OPERATIONS.GIT_COMMIT,
      { commitMessage },
      user,
      options
    );

    if (!response.success) {
      throw createRuntimeError(
        response.error?.code || RUNTIME_ERROR_CODES.GIT_FAILURE,
        response.error?.message || "Failed to execute Git commit",
        "git.commit",
        { commitMessage }
      );
    }

    return {
      success: true,
      hash: response.data?.result?.hash || "committed",
      message: response.data?.result?.message || commitMessage,
      output: response.data?.output || "Commit executed successfully",
    };
  }
}

export const gitService = new GitService();
export default gitService;
