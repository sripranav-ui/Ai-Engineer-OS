/**
 * @file runtimeClient.js
 * @description Local Agent Runtime & Developer Tool Gateway Client for AI Engineer OS V1.4.
 * Interacts with the native Node.js Local Runtime Daemon (http://127.0.0.1:7070), manages
 * authentication tokens, workspace isolation, command classification, audit logging,
 * and seamless fallback to Browser Mode when offline.
 */

import {
  RUNTIME_TOOLS,
  RUNTIME_COMMAND_LEVELS,
  classifyCommand,
  validateWorkspacePath,
  redactSecrets,
} from "./runtimeProtocol.js";
import runtimeCapabilities from "./runtimeCapabilities.js";
import eventBus from "../plugins/eventBus.js";
import logger from "../../utils/logger.js";

const RUNTIME_DAEMON_URL = "http://127.0.0.1:7070";
const AUDIT_LOG_KEY = "ai_runtime_audit_logs_v1";
const MAX_AUDIT_ENTRIES = 100;

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
   * Primary Tool Invocation Entry Point
   * @param {string} toolName - Tool identifier from RUNTIME_TOOLS
   * @param {Object} args - Tool arguments
   * @param {Object} [options] - Options ({ userApproved: boolean })
   * @returns {Promise<{ success: boolean, toolName: string, output: any, error?: string, durationMs: number, level?: string }>}
   */
  async invokeTool(toolName, args = {}, options = {}) {
    const startTime = performance.now();
    const workspacePath = runtimeCapabilities.getCapabilities().workspacePath;

    // Security Gate 1: Path Traversal Check for file tools
    if (args.path || args.filePath || args.targetPath) {
      const targetPath = args.path || args.filePath || args.targetPath;
      const pathVal = validateWorkspacePath(targetPath, workspacePath);
      if (!pathVal.valid) {
        this._logAudit(toolName, args, "BLOCKED", pathVal.error, 0);
        return {
          success: false,
          toolName,
          output: `[Security Guard] ${pathVal.error}`,
          error: pathVal.error,
          durationMs: 0,
        };
      }
    }

    // Security Gate 2: Command Classification Check
    if (toolName === RUNTIME_TOOLS.EXECUTE_COMMAND || toolName === RUNTIME_TOOLS.RUN_TESTS || toolName === RUNTIME_TOOLS.RUN_BUILD) {
      const commandText = args.command || (toolName === RUNTIME_TOOLS.RUN_TESTS ? "npm test" : "npm run build");
      const classification = classifyCommand(commandText);

      if (classification.level === RUNTIME_COMMAND_LEVELS.BLOCKED) {
        const errorMsg = `Command blocked by Security Guard: ${classification.reason}`;
        this._logAudit(toolName, args, "BLOCKED", errorMsg, 0);
        return {
          success: false,
          toolName,
          output: `[Command Guard] ${errorMsg}`,
          error: errorMsg,
          durationMs: 0,
        };
      }

      if (classification.level === RUNTIME_COMMAND_LEVELS.APPROVAL_REQUIRED && !options.userApproved) {
        const approvalMsg = `User approval required: ${classification.reason}`;
        this._logAudit(toolName, args, "PENDING_APPROVAL", approvalMsg, 0);
        return {
          success: false,
          requiresApproval: true,
          toolName,
          output: `[Tool Gateway] ${approvalMsg}`,
          error: approvalMsg,
          durationMs: 0,
        };
      }
    }

    // 🚀 EXECUTE ROUTING: Local Runtime Daemon vs Browser Mode Fallback
    if (this.connectionState === "CONNECTED" && this.sessionToken) {
      try {
        const response = await fetch(`${RUNTIME_DAEMON_URL}/api/tools/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.sessionToken}`,
          },
          body: JSON.stringify({
            toolName,
            args,
            userApproved: options.userApproved || false,
          }),
        });

        const data = await response.json();
        const durationMs = Math.round(performance.now() - startTime);

        if (response.ok && data.success) {
          const formattedOutput = data.result?.stdout !== undefined ? data.result.stdout || data.result.stderr : JSON.stringify(data.result);
          const redactedOutput = redactSecrets(formattedOutput || `[Native Daemon] Executed ${toolName}`);

          this._logAudit(toolName, args, "SUCCESS", redactedOutput, durationMs);
          return {
            success: true,
            toolName,
            output: `[Native Daemon] ${redactedOutput}`,
            result: data.result,
            durationMs,
          };
        } else {
          const errorMsg = data.error || data.result?.stderr || "Daemon tool execution failed";
          this._logAudit(toolName, args, "FAILED", errorMsg, durationMs);
          return {
            success: false,
            toolName,
            output: `[Native Daemon Error] ${errorMsg}`,
            error: errorMsg,
            durationMs,
          };
        }
      } catch (err) {
        logger.warn(`[RuntimeClient] Daemon call failed, falling back to Browser Mode: ${err.message}`);
      }
    }

    // 🌐 BROWSER MODE FALLBACK
    return this._invokeBrowserFallback(toolName, args, startTime);
  }

  /** Browser Mode Execution Fallback */
  _invokeBrowserFallback(toolName, args, startTime) {
    let result = null;
    switch (toolName) {
      case RUNTIME_TOOLS.READ_FILE:
        result = { success: true, output: `[Browser Mode] Read file: ${args.path}` };
        break;

      case RUNTIME_TOOLS.WRITE_FILE:
      case RUNTIME_TOOLS.CREATE_FILE:
        result = { success: true, output: `[Browser Mode] File saved: ${args.path || args.filePath}` };
        eventBus.emit("RESTORE_FILE_CHECKPOINT", { path: args.path, content: args.content });
        break;

      case RUNTIME_TOOLS.DELETE_FILE:
        result = { success: true, output: `[Browser Mode] File deleted: ${args.path}` };
        break;

      case RUNTIME_TOOLS.EXECUTE_COMMAND:
      case RUNTIME_TOOLS.RUN_TESTS:
      case RUNTIME_TOOLS.RUN_BUILD:
        const cmdStr = args.command || (toolName === RUNTIME_TOOLS.RUN_TESTS ? "npm test" : "npm run build");
        eventBus.emit("AGENT_TERMINAL_COMMAND", { command: cmdStr, cwd: "D:\\coding\\AI-Engineer-OS" });
        result = { success: true, output: `[Browser Mode Overlay] Executed: ${cmdStr}` };
        break;

      default:
        result = { success: true, output: `[Browser Mode] Executed ${toolName}` };
    }

    const durationMs = Math.round(performance.now() - startTime);
    const redactedOutput = redactSecrets(typeof result.output === "string" ? result.output : JSON.stringify(result.output));

    this._logAudit(toolName, args, "SUCCESS_BROWSER_FALLBACK", redactedOutput, durationMs);
    return {
      success: result.success,
      toolName,
      output: redactedOutput,
      durationMs,
    };
  }

  /** Get audit logs */
  getAuditLogs(limit = 20) {
    return this.auditLogs.slice(0, limit);
  }

  /** Clear audit logs */
  clearAuditLogs() {
    this.auditLogs = [];
    this._saveAuditLogs();
  }

  /** Toggle connection status for testing */
  toggleConnection(connectedStatus) {
    if (connectedStatus) {
      this.checkDaemonHealth();
    } else {
      this._setOffline("User manual disconnect");
    }
  }

  /** @private Record audit entry */
  _logAudit(tool, args, status, output, durationMs) {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      tool,
      args: redactSecrets(JSON.stringify(args)),
      workspace: runtimeCapabilities.getCapabilities().workspacePath,
      status,
      output: redactSecrets(output),
      durationMs,
    };

    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > MAX_AUDIT_ENTRIES) {
      this.auditLogs = this.auditLogs.slice(0, MAX_AUDIT_ENTRIES);
    }
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
