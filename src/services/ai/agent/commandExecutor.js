/**
 * @file commandExecutor.js
 * @description Command Execution Boundary for AI Agent Pipeline & Terminal Overlay.
 * Enforces command safety rules, detects dangerous CLI patterns, requires explicit
 * approval for destructive operations, and formats structured execution metadata.
 */

import eventBus from "../../plugins/eventBus.js";

// Comprehensive Dangerous Command Patterns
const BLOCKED_PATTERNS = [
  { pattern: /rm\s+-rf\s+(\/|\*|~\/)/i, reason: "Recursive root/home directory deletion", category: "DESTRUCTIVE_DELETE" },
  { pattern: /rmdir\s+\/s\s+\/q\s+[c-z]:\\/i, reason: "Recursive disk directory deletion", category: "DESTRUCTIVE_DELETE" },
  { pattern: /\b(format|mkfs|fdisk)\b/i, reason: "Disk formatting or partitioning", category: "DISK_FORMAT" },
  { pattern: /\b(shutdown|reboot|init\s+0|stop-computer)\b/i, reason: "System shutdown or restart", category: "SYSTEM_SHUTDOWN" },
  { pattern: /git\s+(push\s+.*(--force|-f)|reset\s+--hard|clean\s+-fdx)/i, reason: "Destructive Git force push, hard reset, or clean", category: "GIT_DESTRUCTIVE" },
  { pattern: /(curl|wget)\s+.*\|\s*(sh|bash|powershell|cmd)/i, reason: "Arbitrary remote script execution via pipe", category: "UNSAFE_REMOTE_EXEC" },
  { pattern: /iex\s*\(new-object\s+net\.webclient\)/i, reason: "Unsafe PowerShell remote expression download", category: "UNSAFE_REMOTE_EXEC" },
  { pattern: /(sudo\s+su|chmod\s+-R\s+777\s+\/)/i, reason: "Dangerous privilege elevation or permissive root permissions", category: "PRIVILEGE_ELEVATION" },
];

const REQUIRES_APPROVAL_PATTERNS = [
  { pattern: /npm\s+(install|i|uninstall|remove|publish)\b/i, reason: "Package installation or dependency modification" },
  { pattern: /git\s+(commit|push|checkout|branch -D)\b/i, reason: "Version control modification" },
  { pattern: /docker\s+(run|rm|rmi|system prune)\b/i, reason: "Container lifecycle modification" },
  { pattern: /pip\s+(install|uninstall)\b/i, reason: "Python package modification" },
];

class CommandExecutor {
  constructor() {
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * Validate CLI command against safety rules
   * @param {string} command - Raw CLI command string
   * @returns {{ safe: boolean, requiresApproval: boolean, category?: string, reason?: string }}
   */
  validateCommand(command = "") {
    const trimmed = command.trim();
    if (!trimmed) {
      return { safe: false, requiresApproval: false, reason: "Empty command string" };
    }

    // 1. Check for blocked dangerous commands
    for (const rule of BLOCKED_PATTERNS) {
      if (rule.pattern.test(trimmed)) {
        return {
          safe: false,
          requiresApproval: false,
          category: rule.category,
          reason: `Blocked dangerous command pattern: ${rule.reason}`,
        };
      }
    }

    // 2. Check for commands requiring explicit user approval
    for (const rule of REQUIRES_APPROVAL_PATTERNS) {
      if (rule.pattern.test(trimmed)) {
        return {
          safe: true,
          requiresApproval: true,
          reason: `Requires user confirmation: ${rule.reason}`,
        };
      }
    }

    return { safe: true, requiresApproval: false };
  }

  /**
   * Execute a command via Studio terminal overlay boundary
   * @param {string} command - CLI command string
   * @param {Object} [options] - Execution options ({ cwd, timeout, silent, userApproved })
   * @returns {Promise<{ success: boolean, command: string, output: string, exitCode: number, durationMs: number, executionBoundary: string, requiresApproval?: boolean }>}
   */
  async execute(command = "", options = {}) {
    const startTime = performance.now();
    const validation = this.validateCommand(command);

    const entry = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      command,
      timestamp: Date.now(),
      options,
      status: "running",
      output: "",
      exitCode: null,
      executionBoundary: "Studio Terminal Overlay Runtime",
    };

    this.history.unshift(entry);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }

    // Block dangerous commands automatically
    if (!validation.safe) {
      entry.status = "blocked";
      entry.output = `[Command Execution Guard] ${validation.reason}`;
      entry.exitCode = 126;

      return {
        success: false,
        command,
        output: entry.output,
        exitCode: 126,
        durationMs: Math.round(performance.now() - startTime),
        executionBoundary: entry.executionBoundary,
        reason: validation.reason,
      };
    }

    // Prompt for approval if required and not pre-approved
    if (validation.requiresApproval && !options.userApproved) {
      entry.status = "pending_approval";
      entry.output = `[Command Execution Boundary] ${validation.reason}`;
      entry.exitCode = 1;

      return {
        success: false,
        requiresApproval: true,
        command,
        output: entry.output,
        exitCode: 1,
        durationMs: Math.round(performance.now() - startTime),
        executionBoundary: entry.executionBoundary,
        reason: validation.reason,
      };
    }

    try {
      // Dispatch to Studio terminal overlay interface
      eventBus.emit("AGENT_TERMINAL_COMMAND", {
        id: entry.id,
        command,
        cwd: options.cwd || ".",
      });

      const outputMessage = `[Studio Terminal Runtime] Executed command: "${command}" (cwd: ${options.cwd || "."})`;

      entry.status = "completed";
      entry.output = outputMessage;
      entry.exitCode = 0;

      return {
        success: true,
        command,
        output: outputMessage,
        exitCode: 0,
        durationMs: Math.round(performance.now() - startTime),
        executionBoundary: entry.executionBoundary,
      };
    } catch (err) {
      entry.status = "failed";
      entry.output = err.message;
      entry.exitCode = 1;

      return {
        success: false,
        command,
        output: err.message,
        exitCode: 1,
        durationMs: Math.round(performance.now() - startTime),
        executionBoundary: entry.executionBoundary,
      };
    }
  }

  /**
   * Get command execution history
   * @param {number} [limit=20]
   * @returns {Array}
   */
  getHistory(limit = 20) {
    return this.history.slice(0, limit);
  }

  /** Clear command history */
  clearHistory() {
    this.history = [];
  }
}

export const commandExecutor = new CommandExecutor();
export default commandExecutor;
