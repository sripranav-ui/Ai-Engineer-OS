/**
 * @file repositoryService.js
 * @description High-Level Repository Engineering & Safety Layer for AI Engineer OS.
 * Combines Authorization, Git Inspection, Secret Scanning, Working Tree Safety Guards, and Audit Logging.
 */

import gitService from "../runtime/gitService.js";
import secretScanner from "./secretScanner.js";
import workingTreeGuard from "./workingTreeGuard.js";
import { hasPermission } from "../auth/authorization.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";
import { logAuditEvent, AUDIT_EVENTS } from "../auth/auditLogger.js";
import { RUNTIME_ERROR_CODES, createRuntimeError } from "../runtime/runtimeErrors.js";
import runtimeCapabilities from "../runtime/runtimeCapabilities.js";

export class RepositoryService {
  /**
   * Comprehensive repository state inspection
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async getRepositoryState(user) {
    if (!user || !hasPermission(user, PERMISSIONS.READ_REPOSITORY)) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        "User identity missing or lacks capability permission 'read_repository'",
        "repository.getState"
      );
    }

    const isRepo = await gitService.isRepository(user);
    if (!isRepo) {
      return {
        isRepository: false,
        root: runtimeCapabilities.getCapabilities().workspacePath,
        branch: "none",
        isProtected: false,
        isDetached: false,
        dirtyState: { clean: true },
        secretFindings: [],
      };
    }

    const statusRes = await gitService.getStatus(user);
    const statusInfo = workingTreeGuard.analyzeStatus(statusRes.status);
    const diffRes = await gitService.getDiff(user);
    const scanInfo = secretScanner.scanDiff(diffRes.diff);

    return {
      isRepository: true,
      root: runtimeCapabilities.getCapabilities().workspacePath,
      branch: statusInfo.currentBranch,
      isProtected: workingTreeGuard.isProtectedBranch(statusInfo.currentBranch),
      isDetached: statusInfo.isDetached,
      dirtyState: statusInfo,
      secretFindings: scanInfo.findings,
    };
  }

  /**
   * Create a new local Git branch safely
   * @param {string} branchName
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async createBranch(branchName, user) {
    if (!user || !hasPermission(user, PERMISSIONS.CREATE_BRANCH)) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        "User identity missing or lacks capability permission 'create_branch'",
        "repository.createBranch",
        { branchName }
      );
      logAuditEvent(AUDIT_EVENTS.PERMISSION_DENIED, { operation: "repository.createBranch", branchName }, user);
      throw err;
    }

    const state = await this.getRepositoryState(user);
    const safety = workingTreeGuard.evaluateOperationSafety("createBranch", state.dirtyState, { branchName });

    if (!safety.safe) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        safety.error,
        "repository.createBranch",
        { branchName }
      );
    }

    logAuditEvent(AUDIT_EVENTS.GITHUB_ACTION, { action: "create_branch", branchName }, user);
    return gitService.createBranch(branchName, user);
  }

  /**
   * Switch active Git branch safely
   * @param {string} targetBranch
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async switchBranch(targetBranch, user) {
    if (!user || !hasPermission(user, PERMISSIONS.SWITCH_BRANCH)) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        "User identity missing or lacks capability permission 'switch_branch'",
        "repository.switchBranch",
        { targetBranch }
      );
      logAuditEvent(AUDIT_EVENTS.PERMISSION_DENIED, { operation: "repository.switchBranch", targetBranch }, user);
      throw err;
    }

    const state = await this.getRepositoryState(user);
    const safety = workingTreeGuard.evaluateOperationSafety("switchBranch", state.dirtyState, { targetBranch });

    if (!safety.safe) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.WORKSPACE_VIOLATION,
        safety.error,
        "repository.switchBranch",
        { targetBranch, dirtyState: state.dirtyState }
      );
    }

    logAuditEvent(AUDIT_EVENTS.GITHUB_ACTION, { action: "switch_branch", targetBranch }, user);
    return gitService.switchBranch(targetBranch, user);
  }

  /**
   * Safe Commit Preparation & Execution
   * @param {string} commitMessage
   * @param {Object} user
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async prepareCommit(commitMessage, user, options = {}) {
    if (!user || !hasPermission(user, PERMISSIONS.CREATE_COMMIT)) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        "User identity missing or lacks capability permission 'create_commit'",
        "repository.prepareCommit",
        { commitMessage: secretScanner.redactSecrets(commitMessage) }
      );
      logAuditEvent(AUDIT_EVENTS.PERMISSION_DENIED, { operation: "repository.prepareCommit" }, user);
      throw err;
    }

    const state = await this.getRepositoryState(user);
    const safety = workingTreeGuard.evaluateOperationSafety("commit", state.dirtyState, { commitMessage, allowEmpty: options.allowEmpty });

    if (!safety.safe) {
      throw createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        safety.error,
        "repository.prepareCommit",
        { commitMessage: secretScanner.redactSecrets(commitMessage) }
      );
    }

    // Secret Scan Staged Diff & Commit Message
    const msgScan = secretScanner.scanContent(commitMessage, "commit_message");
    if (!msgScan.clean || state.secretFindings.length > 0) {
      const findingsCount = msgScan.count + state.secretFindings.length;
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.COMMAND_BLOCKED,
        `Commit blocked: Secret scanner detected ${findingsCount} credential match(es) in commit payload`,
        "repository.prepareCommit",
        { secretFindingsCount: findingsCount }
      );
      logAuditEvent(AUDIT_EVENTS.GITHUB_ACTION, { action: "commit_blocked_secret_detected", findingsCount }, user);
      throw err;
    }

    // Require Explicit User Approval for Commits
    if (!options.userApproved) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        "Explicit user approval required to execute Git commit",
        "repository.prepareCommit",
        { requiresApproval: true }
      );
      logAuditEvent(AUDIT_EVENTS.GITHUB_ACTION, { action: "commit_pending_approval" }, user);
      throw err;
    }

    logAuditEvent(
      AUDIT_EVENTS.GITHUB_ACTION,
      { action: "commit_executed", branch: state.branch },
      user
    );

    return gitService.commit(secretScanner.redactSecrets(commitMessage), user, options);
  }
}

export const repositoryService = new RepositoryService();
export default repositoryService;
