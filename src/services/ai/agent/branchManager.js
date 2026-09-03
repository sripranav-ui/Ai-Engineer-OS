/**
 * @file branchManager.js
 * @description Branch Safety & Working Tree Manager for AI Engineer OS V1.6.
 * Protects uncommitted user work and manages isolated Git feature branch workflows.
 */

import runtimeClient from "../../runtime/runtimeClient.js";

class BranchManager {
  /**
   * Check if the working tree has uncommitted changes
   * @returns {Promise<{ isDirty: boolean, currentBranch: string, uncommittedChanges: Array, error?: string }>}
   */
  async checkWorkingTree() {
    try {
      const res = await runtimeClient.invokeTool("git_status", {});
      if (!res.success) {
        return {
          isDirty: false,
          currentBranch: "main",
          uncommittedChanges: [],
          error: res.error || "Failed to fetch git status",
        };
      }

      const statusData = res.result || {};
      return {
        isDirty: Boolean(statusData.isDirty),
        currentBranch: statusData.currentBranch || "main",
        uncommittedChanges: statusData.uncommittedChanges || [],
        rawOutput: statusData.rawOutput || "",
      };
    } catch (err) {
      return {
        isDirty: false,
        currentBranch: "main",
        uncommittedChanges: [],
        error: err.message,
      };
    }
  }

  /**
   * Generate safe and predictable branch name from task title
   * @param {string} taskTitle
   * @returns {string}
   */
  generateBranchName(taskTitle = "") {
    const slug = taskTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 40);

    return `feature/ai-engineer-os-${slug || "task"}`;
  }

  /**
   * Create dedicated feature branch using native Git
   * @param {string} branchName
   * @param {boolean} userApproved
   * @returns {Promise<{ success: boolean, branchName: string, output: string, error?: string }>}
   */
  async createAndCheckoutBranch(branchName, userApproved = false) {
    if (!userApproved) {
      return {
        success: false,
        requiresApproval: true,
        branchName,
        output: `Explicit user approval required to create branch '${branchName}'`,
      };
    }

    const res = await runtimeClient.invokeTool(
      "git_checkout",
      { branchName, createNew: true },
      { userApproved: true }
    );

    if (res.success) {
      return {
        success: true,
        branchName,
        output: res.output || `Switched to branch '${branchName}'`,
      };
    } else {
      return {
        success: false,
        branchName,
        output: res.output || "Branch creation failed",
        error: res.error,
      };
    }
  }
}

export const branchManager = new BranchManager();
export default branchManager;
