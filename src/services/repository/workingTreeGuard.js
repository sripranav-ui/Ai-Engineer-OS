/**
 * @file workingTreeGuard.js
 * @description Working Tree Safety & Protected Branch Policy Guard for AI Engineer OS.
 * Analyzes Git status output and enforces dirty-working-tree protection and branch safety.
 */

export const PROTECTED_BRANCHES = ["main", "master"];

/**
 * Parse raw Git status output into structured working tree state
 * @param {string} statusOutput
 * @returns {{
 *   clean: boolean,
 *   currentBranch: string,
 *   isDetached: boolean,
 *   inMerge: boolean,
 *   inRebase: boolean,
 *   modifiedFiles: Array<string>,
 *   stagedFiles: Array<string>,
 *   untrackedFiles: Array<string>,
 *   deletedFiles: Array<string>
 * }}
 */
export function analyzeStatus(statusOutput = "") {
  const lines = typeof statusOutput === "string" ? statusOutput.split("\n") : [];
  const modifiedFiles = [];
  const stagedFiles = [];
  const untrackedFiles = [];
  const deletedFiles = [];

  let currentBranch = "main";
  let isDetached = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("On branch ")) {
      currentBranch = trimmed.replace("On branch ", "").trim();
    } else if (trimmed.includes("HEAD detached") || trimmed.includes("detached at")) {
      isDetached = true;
      currentBranch = "(HEAD detached)";
    }

    // Short status codes check (e.g. M, A, D, ??)
    if (trimmed.startsWith("M ") || trimmed.includes("modified:")) {
      modifiedFiles.push(trimmed);
    } else if (trimmed.startsWith("A ") || trimmed.includes("new file:")) {
      stagedFiles.push(trimmed);
    } else if (trimmed.startsWith("D ") || trimmed.includes("deleted:")) {
      deletedFiles.push(trimmed);
    } else if (trimmed.startsWith("??") || trimmed.includes("Untracked files:")) {
      untrackedFiles.push(trimmed);
    }
  }

  const inMerge = statusOutput.includes("You have unmerged paths") || statusOutput.includes("Fix conflicts");
  const inRebase = statusOutput.includes("rebase in progress");
  const clean = modifiedFiles.length === 0 && stagedFiles.length === 0 && deletedFiles.length === 0 && !inMerge && !inRebase;

  return {
    clean,
    currentBranch,
    isDetached,
    inMerge,
    inRebase,
    modifiedFiles,
    stagedFiles,
    untrackedFiles,
    deletedFiles,
  };
}

/**
 * Validate branch name syntax
 * @param {string} branchName
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateBranchName(branchName = "") {
  if (!branchName || typeof branchName !== "string") {
    return { valid: false, error: "Branch name must be a non-empty string" };
  }

  const trimmed = branchName.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { valid: false, error: "Branch name length must be between 2 and 100 characters" };
  }

  // Git branch naming rules
  if (
    trimmed.startsWith("-") ||
    trimmed.startsWith("/") ||
    trimmed.endsWith("/") ||
    trimmed.endsWith(".lock") ||
    /\s/.test(trimmed) ||
    /[\x00-\x20\x7F~^:?*\[\\]/.test(trimmed) ||
    trimmed.includes("..") ||
    trimmed.includes("@{")
  ) {
    return { valid: false, error: "Invalid branch name syntax according to Git naming rules" };
  }

  return { valid: true };
}

/**
 * Check if branch is protected
 * @param {string} branchName
 * @returns {boolean}
 */
export function isProtectedBranch(branchName = "") {
  if (!branchName) return false;
  return PROTECTED_BRANCHES.includes(branchName.trim().toLowerCase());
}

/**
 * Evaluate safety of a proposed Git operation against working tree state
 * @param {string} operation - "switchBranch" | "createBranch" | "commit"
 * @param {Object} statusInfo - Result from analyzeStatus()
 * @param {Object} [details] - Details payload
 * @returns {{ safe: boolean, error?: string }}
 */
export function evaluateOperationSafety(operation, statusInfo = {}, details = {}) {
  if (!statusInfo || typeof statusInfo !== "object") {
    return { safe: false, error: "Missing or invalid working tree status information" };
  }

  if (statusInfo.inMerge) {
    return { safe: false, error: "Working tree is currently in a merge conflict state. Resolve conflicts first." };
  }

  if (statusInfo.inRebase) {
    return { safe: false, error: "Working tree is currently in a rebase state. Complete or abort rebase first." };
  }

  switch (operation) {
    case "switchBranch":
      if (!statusInfo.clean) {
        return {
          safe: false,
          error: "Unsafe branch switch rejected: Working tree contains uncommitted changes. Stash or commit changes first.",
        };
      }
      if (details.targetBranch) {
        const val = validateBranchName(details.targetBranch);
        if (!val.valid) return { safe: false, error: val.error };
      }
      return { safe: true };

    case "createBranch":
      if (details.branchName) {
        const val = validateBranchName(details.branchName);
        if (!val.valid) return { safe: false, error: val.error };
      }
      return { safe: true };

    case "commit":
      if (statusInfo.clean && statusInfo.untrackedFiles.length === 0 && !details.allowEmpty) {
        return { safe: false, error: "Commit rejected: Working tree is clean. Nothing to commit." };
      }
      if (details.commitMessage) {
        const msg = String(details.commitMessage).trim();
        if (!msg || msg.length < 3) {
          return { safe: false, error: "Commit rejected: Commit message must be at least 3 characters long." };
        }
      }
      return { safe: true };

    default:
      return { safe: false, error: `Unknown operation '${operation}' evaluated for working tree safety.` };
  }
}

export default {
  PROTECTED_BRANCHES,
  analyzeStatus,
  validateBranchName,
  isProtectedBranch,
  evaluateOperationSafety,
};
