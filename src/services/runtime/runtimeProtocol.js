/**
 * @file runtimeProtocol.js
 * @description Communication Protocol & Security Schema for V1.3 Local Agent Runtime Gateway.
 * Defines tool call contracts, permission levels, path traversal guards, and secret redaction.
 */

export const RUNTIME_COMMAND_LEVELS = {
  SAFE: "SAFE",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  BLOCKED: "BLOCKED",
};

export const RUNTIME_TOOLS = {
  READ_FILE: "read_file",
  WRITE_FILE: "write_file",
  CREATE_FILE: "create_file",
  DELETE_FILE: "delete_file",
  LIST_DIRECTORY: "list_directory",
  SEARCH_FILES: "search_files",
  EXECUTE_COMMAND: "execute_command",
  RUN_TESTS: "run_tests",
  RUN_BUILD: "run_build",
  GIT_STATUS: "git_status",
  GIT_DIFF: "git_diff",
  GIT_LOG: "git_log",
  GIT_BRANCH: "git_branch",
  GIT_CHECKOUT: "git_checkout",
  GIT_ADD: "git_add",
  GIT_COMMIT: "git_commit",
};

/** Dangerous patterns blocked automatically */
const BLOCKED_COMMAND_PATTERNS = [
  { pattern: /rm\s+-rf\s+(\/|\*|~\/)/i, reason: "Recursive root/home deletion" },
  { pattern: /rmdir\s+\/s\s+\/q\s+[c-z]:\\/i, reason: "Recursive disk deletion" },
  { pattern: /\b(format|mkfs|fdisk)\b/i, reason: "Disk formatting" },
  { pattern: /\b(shutdown|reboot|init\s+0)\b/i, reason: "System shutdown/reboot" },
  { pattern: /git\s+(reset\s+--hard|clean\s+-fd|checkout\s+--\s+\.|restore\s+\.)/i, reason: "Destructive git operation" },
  { pattern: /git\s+push\s+.*(--force|-f)/i, reason: "Force push operation" },
  { pattern: /(curl|wget)\s+.*\|\s*(sh|bash|powershell|cmd)/i, reason: "Unsafe remote execution" },
  { pattern: /(sudo\s+su|chmod\s+-R\s+777\s+\/)/i, reason: "Privilege escalation" },
];

/** Operations requiring explicit user confirmation */
const APPROVAL_REQUIRED_PATTERNS = [
  { pattern: /npm\s+(install|i|uninstall|remove|publish)\b/i, reason: "Dependency modification" },
  { pattern: /git\s+(commit|push|checkout|branch\s+-D)\b/i, reason: "Version control mutation" },
  { pattern: /docker\s+(run|rm|system\s+prune)\b/i, reason: "Container lifecycle change" },
  { pattern: /pip\s+(install|uninstall)\b/i, reason: "Python dependency change" },
];

/**
 * Classify CLI command safety
 * @param {string} command
 * @returns {{ level: string, reason?: string }}
 */
export function classifyCommand(command = "") {
  const trimmed = command.trim();
  if (!trimmed) {
    return { level: RUNTIME_COMMAND_LEVELS.BLOCKED, reason: "Empty command string" };
  }

  for (const rule of BLOCKED_COMMAND_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return { level: RUNTIME_COMMAND_LEVELS.BLOCKED, reason: `Blocked: ${rule.reason}` };
    }
  }

  for (const rule of APPROVAL_REQUIRED_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return { level: RUNTIME_COMMAND_LEVELS.APPROVAL_REQUIRED, reason: `Approval needed: ${rule.reason}` };
    }
  }

  return { level: RUNTIME_COMMAND_LEVELS.SAFE };
}

/**
 * Validate path stays inside designated workspace
 * @param {string} targetPath - Relative or target file path
 * @param {string} workspacePath - Active local workspace root
 * @returns {{ valid: boolean, canonicalPath?: string, error?: string }}
 */
export function validateWorkspacePath(targetPath = "", workspacePath = "D:\\coding\\AI-Engineer-OS") {
  if (!targetPath) {
    return { valid: false, error: "Empty path parameter" };
  }

  // Prevent path traversal escape attempts
  if (targetPath.includes("../") || targetPath.includes("..\\")) {
    return { valid: false, error: "Path traversal pattern ('../') blocked" };
  }

  // Check absolute path escape
  if ((targetPath.startsWith("/") || targetPath.match(/^[a-zA-Z]:\\/)) && !targetPath.toLowerCase().startsWith(workspacePath.toLowerCase())) {
    return { valid: false, error: `Path escapes active workspace boundary (${workspacePath})` };
  }

  const normalized = targetPath.replace(/\\/g, "/");
  return { valid: true, canonicalPath: normalized };
}

/**
 * Filter sensitive API keys and secrets from output logs
 * @param {string} text
 * @returns {string}
 */
export function redactSecrets(text = "") {
  if (typeof text !== "string") return text;
  return text
    .replace(/(runtime_tok_[a-f0-9]{20,})/gi, "[REDACTED]")
    .replace(/(sk-[a-zA-Z0-9]{20,})/g, "sk-***[REDACTED]***")
    .replace(/(AIzaSy[a-zA-Z0-9_-]{33})/g, "AIzaSy***[REDACTED]***")
    .replace(/(Bearer\s+[a-zA-Z0-9._-]{20,})/gi, "Bearer ***[REDACTED]***");
}
