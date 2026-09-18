/**
 * @file runtimeClient.js
 * @description Local Agent Runtime & Gateway Client for AI Engineer OS.
 * Manages authorization checks, structured request/response protocol, daemon communications,
 * path traversal guards, command classification, audit logging, and browser fallback.
 */

import {
  RUNTIME_TOOLS,
  RUNTIME_COMMAND_LEVELS,
  STRUCTURED_OPERATIONS,
  OPERATION_TO_TOOL_MAP,
  classifyCommand,
  validateWorkspacePath,
  redactSecrets,
  createRuntimeRequest,
  validateRuntimeRequest,
  createRuntimeResponse,
} from "./runtimeProtocol.js";
import {
  RUNTIME_ERROR_CODES,
  createRuntimeError,
} from "./runtimeErrors.js";
import runtimeCapabilities from "./runtimeCapabilities.js";
import { hasPermission } from "../auth/authorization.js";
import { PERMISSIONS } from "../auth/permissionDefinitions.js";
import { logAuditEvent, AUDIT_EVENTS } from "../auth/auditLogger.js";
import eventBus from "../plugins/eventBus.js";
import logger from "../../utils/logger.js";

const RUNTIME_DAEMON_URL = "http://127.0.0.1:7070";
const AUDIT_LOG_KEY = "ai_runtime_audit_logs_v1";
const MAX_AUDIT_ENTRIES = 100;

/** Map structured operations to capability permissions */
const OPERATION_PERMISSION_MAP = {
  [STRUCTURED_OPERATIONS.FILESYSTEM_READ]: PERMISSIONS.ACCESS_CODING_STUDIO,
  [STRUCTURED_OPERATIONS.FILESYSTEM_LIST]: PERMISSIONS.ACCESS_CODING_STUDIO,
  [STRUCTURED_OPERATIONS.FILESYSTEM_EXISTS]: PERMISSIONS.ACCESS_CODING_STUDIO,
  [STRUCTURED_OPERATIONS.FILESYSTEM_STAT]: PERMISSIONS.ACCESS_CODING_STUDIO,
  [STRUCTURED_OPERATIONS.FILESYSTEM_WRITE]: PERMISSIONS.MODIFY_WORKSPACE,
  [STRUCTURED_OPERATIONS.FILESYSTEM_MKDIR]: PERMISSIONS.MODIFY_WORKSPACE,
  [STRUCTURED_OPERATIONS.FILESYSTEM_DELETE]: PERMISSIONS.MODIFY_WORKSPACE,
  [STRUCTURED_OPERATIONS.GIT_IS_REPO]: PERMISSIONS.READ_REPOSITORY,
  [STRUCTURED_OPERATIONS.GIT_STATUS]: PERMISSIONS.READ_REPOSITORY,
  [STRUCTURED_OPERATIONS.GIT_DIFF]: PERMISSIONS.READ_REPOSITORY,
  [STRUCTURED_OPERATIONS.GIT_BRANCHES]: PERMISSIONS.READ_REPOSITORY,
  [STRUCTURED_OPERATIONS.GIT_CURRENT_BRANCH]: PERMISSIONS.READ_REPOSITORY,
  [STRUCTURED_OPERATIONS.GIT_LOG]: PERMISSIONS.READ_REPOSITORY,
  [STRUCTURED_OPERATIONS.GIT_CREATE_BRANCH]: PERMISSIONS.CREATE_BRANCH,
  [STRUCTURED_OPERATIONS.GIT_CHECKOUT_BRANCH]: PERMISSIONS.SWITCH_BRANCH,
  [STRUCTURED_OPERATIONS.GIT_COMMIT]: PERMISSIONS.CREATE_COMMIT,
  [STRUCTURED_OPERATIONS.COMMAND_EXECUTE]: PERMISSIONS.EXECUTE_TERMINAL,
};

class RuntimeClient {
  constructor() {
    this.auditLogs = this._loadAuditLogs();
    this.connectionState = "CONNECTING"; // CONNECTING | CONNECTED | OFFLINE | ERROR
    this.sessionToken = null;
    this.daemonMetadata = null;

    // Probe daemon health on initialization
    this.checkDaemonHealth();
  }

  /** Probe Local Runtime Daemon health endpoint */
  async checkDaemonHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${RUNTIME_DAEMON_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.connectionState = "CONNECTED";
        this.sessionToken = data.token;
        this.daemonMetadata = data;

        runtimeCapabilities.setConnected(true, {
          workspacePath: data.workspace,
          capabilities: data.capabilities,
          version: data.version,
        });

        logger.info(`[RuntimeClient] Connected to Native Local Runtime Daemon (${data.version}) at ${RUNTIME_DAEMON_URL}`);
        return { connected: true, data };
      } else {
        this._setOffline("Health check returned non-200 status");
        return { connected: false };
      }
    } catch (err) {
      this._setOffline(err.message || "Could not connect to daemon");
      return { connected: false };
    }
  }

  /** Set offline state */
  _setOffline(reason) {
    this.connectionState = "OFFLINE";
    this.sessionToken = null;
    runtimeCapabilities.setConnected(false);
  }

  /** Check connection status */
  getStatus() {
    return {
      connected: this.connectionState === "CONNECTED",
      connectionState: this.connectionState,
      capabilities: runtimeCapabilities.getCapabilities(),
      daemonMetadata: this.daemonMetadata,
      auditCount: this.auditLogs.length,
    };
  }

  /**
   * Primary Structured Operation Entry Point
   * @param {string} operation - Structured operation key from STRUCTURED_OPERATIONS
   * @param {Object} payload - Operation parameters
   * @param {Object} user - Authenticated user identity
   * @param {Object} [options] - Options ({ userApproved: boolean })
   * @returns {Promise<Object>} Structured response { id, success, data, error, durationMs }
   */
  async request(operation, payload = {}, user = null, options = {}) {
    const startTime = performance.now();
    const req = createRuntimeRequest(operation, payload);
    const reqValidation = validateRuntimeRequest(req);

    if (!reqValidation.valid) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.INVALID_REQUEST,
        reqValidation.error,
        operation
      );
      this._recordAudit(operation, payload, "BLOCKED", err.message, user, 0);
      return createRuntimeResponse(req.id, false, null, err.toJSON());
    }

    // Security Gate 1: Authorization Permission Check (Fail Closed)
    const requiredPermission = OPERATION_PERMISSION_MAP[operation] || PERMISSIONS.ACCESS_CODING_STUDIO;
    if (!user || !hasPermission(user, requiredPermission)) {
      const err = createRuntimeError(
        RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
        `User identity missing or lacks capability permission '${requiredPermission}'`,
        operation,
        { requiredPermission }
      );
      logAuditEvent(AUDIT_EVENTS.PERMISSION_DENIED, { operation, requiredPermission }, user);
      this._recordAudit(operation, payload, "PERMISSION_DENIED", err.message, user, 0);
      return createRuntimeResponse(req.id, false, null, err.toJSON());
    }

    // Security Gate 2: Workspace Guard Path Validation
    const targetPath = payload.path || payload.filePath || payload.targetPath;
    const workspacePath = runtimeCapabilities.getCapabilities().workspacePath;

    if (targetPath) {
      const pathVal = validateWorkspacePath(targetPath, workspacePath);
      if (!pathVal.valid) {
        const err = createRuntimeError(
          RUNTIME_ERROR_CODES.WORKSPACE_VIOLATION,
          pathVal.error,
          operation,
          { targetPath, workspacePath }
        );
        this._recordAudit(operation, payload, "BLOCKED", pathVal.error, user, 0);
        return createRuntimeResponse(req.id, false, null, err.toJSON());
      }
    }

    // Map structured operation to toolName
    const toolName = OPERATION_TO_TOOL_MAP[operation] || RUNTIME_TOOLS.READ_FILE;

    // Security Gate 3: Command Policy Safety Check
    if (operation === STRUCTURED_OPERATIONS.COMMAND_EXECUTE) {
      const commandText = payload.command || "";
      const classification = classifyCommand(commandText);

      if (classification.level === RUNTIME_COMMAND_LEVELS.BLOCKED) {
        const err = createRuntimeError(
          RUNTIME_ERROR_CODES.COMMAND_BLOCKED,
          `Command blocked by security policy: ${classification.reason}`,
          operation,
          { command: commandText }
        );
        this._recordAudit(operation, payload, "BLOCKED", err.message, user, 0);
        return createRuntimeResponse(req.id, false, null, err.toJSON());
      }

      if (classification.level === RUNTIME_COMMAND_LEVELS.APPROVAL_REQUIRED && !options.userApproved) {
        const err = createRuntimeError(
          RUNTIME_ERROR_CODES.AUTHORIZATION_FAILURE,
          `User approval required: ${classification.reason}`,
          operation,
          { requiresApproval: true }
        );
        this._recordAudit(operation, payload, "PENDING_APPROVAL", err.message, user, 0);
        return createRuntimeResponse(req.id, false, null, err.toJSON());
      }
    }

    // Execute via Native Local Runtime Daemon if connected
    if (this.connectionState === "CONNECTED" && this.sessionToken) {
      try {
        const daemonRes = await fetch(`${RUNTIME_DAEMON_URL}/api/tools/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.sessionToken}`,
          },
          body: JSON.stringify({
            toolName,
            args: payload,
            userApproved: options.userApproved || false,
          }),
        });

        const data = await daemonRes.json();
        const durationMs = Math.round(performance.now() - startTime);

        if (daemonRes.ok && data.success) {
          const redactedOut = redactSecrets(
            typeof data.result === "string"
              ? data.result
              : data.result?.stdout || data.result?.stderr || JSON.stringify(data.result)
          );
          this._recordAudit(operation, payload, "SUCCESS", redactedOut, user, durationMs);
          return createRuntimeResponse(req.id, true, { result: data.result, output: redactedOut });
        } else {
          const errText = data.error || data.result?.stderr || "Native daemon execution failed";
          const err = createRuntimeError(
            RUNTIME_ERROR_CODES.FILESYSTEM_FAILURE,
            errText,
            operation
          );
          this._recordAudit(operation, payload, "FAILED", errText, user, durationMs);
          return createRuntimeResponse(req.id, false, null, err.toJSON());
        }
      } catch (fetchErr) {
        logger.warn(`[RuntimeClient] Daemon call failed, invoking browser fallback: ${fetchErr.message}`);
      }
    }

    // Browser Mode Fallback Execution
    const durationMs = Math.round(performance.now() - startTime);
    const fallbackRes = this._invokeBrowserFallback(operation, toolName, payload);
    this._recordAudit(operation, payload, "SUCCESS_BROWSER_FALLBACK", fallbackRes.output, user, durationMs);
    return createRuntimeResponse(req.id, true, fallbackRes);
  }

  /** Browser Mode Execution Fallback */
  _invokeBrowserFallback(operation, toolName, payload) {
    let output = `[Browser Mode] Executed ${operation}`;
    let result = {};

    switch (operation) {
      case STRUCTURED_OPERATIONS.FILESYSTEM_READ:
        output = `[Browser Mode] Read content of file: ${payload.path || payload.filePath}`;
        result = { exists: true, content: `[Browser Mode Mock Content for ${payload.path || payload.filePath}]` };
        break;

      case STRUCTURED_OPERATIONS.FILESYSTEM_EXISTS:
        output = `[Browser Mode] Exists check: ${payload.path}`;
        result = { exists: true };
        break;

      case STRUCTURED_OPERATIONS.FILESYSTEM_STAT:
        output = `[Browser Mode] Stat: ${payload.path}`;
        result = { stat: { isFile: true, size: 1024, mtime: new Date().toISOString() } };
        break;

      case STRUCTURED_OPERATIONS.FILESYSTEM_LIST:
        output = `[Browser Mode] Directory list: ${payload.path}`;
        result = { files: ["main.py", "package.json", "src/"] };
        break;

      case STRUCTURED_OPERATIONS.FILESYSTEM_WRITE:
      case STRUCTURED_OPERATIONS.FILESYSTEM_MKDIR:
        output = `[Browser Mode] Wrote target: ${payload.path || payload.filePath}`;
        result = { written: true };
        eventBus.emit("RESTORE_FILE_CHECKPOINT", { path: payload.path, content: payload.content });
        break;

      case STRUCTURED_OPERATIONS.FILESYSTEM_DELETE:
        output = `[Browser Mode] Deleted target: ${payload.path}`;
        result = { deleted: true };
        break;

      case STRUCTURED_OPERATIONS.GIT_IS_REPO:
      case STRUCTURED_OPERATIONS.GIT_STATUS:
        output = `[Browser Mode] Git status: On branch main, working tree clean`;
        result = { isRepository: true, status: "On branch main, working tree clean", files: [] };
        break;

      case STRUCTURED_OPERATIONS.GIT_DIFF:
        output = `[Browser Mode] Git diff: No active changes`;
        result = { diff: "" };
        break;

      case STRUCTURED_OPERATIONS.GIT_BRANCHES:
        output = `[Browser Mode] Git branches: main`;
        result = { branches: ["main"] };
        break;

      case STRUCTURED_OPERATIONS.GIT_CURRENT_BRANCH:
        output = `[Browser Mode] Git active branch: main`;
        result = { currentBranch: "main" };
        break;

      case STRUCTURED_OPERATIONS.GIT_LOG:
        output = `[Browser Mode] Git log history`;
        result = { commits: [{ hash: "abc1234", message: "Initial commit" }] };
        break;

      case STRUCTURED_OPERATIONS.GIT_CREATE_BRANCH:
        output = `[Browser Mode] Created branch: ${payload.branchName}`;
        result = { branchCreated: true, branchName: payload.branchName };
        break;

      case STRUCTURED_OPERATIONS.GIT_CHECKOUT_BRANCH:
        output = `[Browser Mode] Switched to branch: ${payload.branchName}`;
        result = { branchSwitched: true, branchName: payload.branchName };
        break;

      case STRUCTURED_OPERATIONS.GIT_COMMIT:
        output = `[Browser Mode] Committed: ${payload.commitMessage}`;
        result = { committed: true, hash: `mock_${Date.now().toString(36)}`, message: payload.commitMessage };
        break;

      case STRUCTURED_OPERATIONS.COMMAND_EXECUTE:
        eventBus.emit("AGENT_TERMINAL_COMMAND", { command: payload.command, cwd: payload.cwd || "D:\\coding\\AI-Engineer-OS" });
        output = `[Browser Mode Terminal] Executed: ${payload.command}`;
        result = { stdout: output, stderr: "", exitCode: 0 };
        break;

      default:
        result = { executed: true };
    }

    return { output: redactSecrets(output), result };
  }

  // --- High Level Convenience API ---

  async readFile(path, user) {
    return this.request(STRUCTURED_OPERATIONS.FILESYSTEM_READ, { path }, user);
  }

  async writeFile(path, content, user) {
    return this.request(STRUCTURED_OPERATIONS.FILESYSTEM_WRITE, { path, content }, user);
  }

  async listDirectory(path, user) {
    return this.request(STRUCTURED_OPERATIONS.FILESYSTEM_LIST, { path }, user);
  }

  async createDirectory(path, user) {
    return this.request(STRUCTURED_OPERATIONS.FILESYSTEM_MKDIR, { path }, user);
  }

  async deleteFile(path, user) {
    return this.request(STRUCTURED_OPERATIONS.FILESYSTEM_DELETE, { path }, user);
  }

  async exists(path, user) {
    return this.request(STRUCTURED_OPERATIONS.FILESYSTEM_EXISTS, { path }, user);
  }

  async stat(path, user) {
    return this.request(STRUCTURED_OPERATIONS.FILESYSTEM_STAT, { path }, user);
  }

  async executeCommand(command, cwd, user, options = {}) {
    return this.request(STRUCTURED_OPERATIONS.COMMAND_EXECUTE, { command, cwd }, user, options);
  }

  getWorkspaceInfo() {
    return {
      workspacePath: runtimeCapabilities.getCapabilities().workspacePath,
      connected: this.connectionState === "CONNECTED",
    };
  }

  /** Audit logging helper */
  _recordAudit(operation, payload, status, output, user, durationMs) {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      operation,
      payload: redactSecrets(JSON.stringify(payload)),
      user: user?.email || user?.id || "anonymous",
      workspace: runtimeCapabilities.getCapabilities().workspacePath,
      status,
      output: redactSecrets(typeof output === "string" ? output : JSON.stringify(output)),
      durationMs,
    };

    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > MAX_AUDIT_ENTRIES) {
      this.auditLogs = this.auditLogs.slice(0, MAX_AUDIT_ENTRIES);
    }
    this._saveAuditLogs();

    logAuditEvent(
      AUDIT_EVENTS.RUNTIME_ACTION,
      { operation, status, durationMs },
      user
    );
  }

  getAuditLogs(limit = 20) {
    return this.auditLogs.slice(0, limit);
  }

  clearAuditLogs() {
    this.auditLogs = [];
    this._saveAuditLogs();
  }

  /** @private Load audit logs */
  _loadAuditLogs() {
    try {
      const raw = localStorage.getItem(AUDIT_LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** @private Save audit logs */
  _saveAuditLogs() {
    try {
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(this.auditLogs));
    } catch {
      // Fallback
    }
  }
}

export const runtimeClient = new RuntimeClient();
export default runtimeClient;
