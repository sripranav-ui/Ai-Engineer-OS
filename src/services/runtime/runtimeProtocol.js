/**
 * @file runtimeProtocol.js
 * @description Communication Protocol & Security Schema for V1.4 Local Agent Runtime Gateway.
 * Defines tool call contracts, structured operations, permission mapping, path traversal guards, and secret redaction.
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

export const STRUCTURED_OPERATIONS = {
  FILESYSTEM_READ: "filesystem.read",
  FILESYSTEM_WRITE: "filesystem.write",
  FILESYSTEM_LIST: "filesystem.list",
  FILESYSTEM_MKDIR: "filesystem.mkdir",
  FILESYSTEM_DELETE: "filesystem.delete",
  FILESYSTEM_EXISTS: "filesystem.exists",
  FILESYSTEM_STAT: "filesystem.stat",
  GIT_IS_REPO: "git.is_repository",
  GIT_STATUS: "git.status",
  GIT_DIFF: "git.diff",
  GIT_BRANCHES: "git.branches",
  GIT_CURRENT_BRANCH: "git.current_branch",
  GIT_LOG: "git.log",
  GIT_CREATE_BRANCH: "git.create_branch",
  GIT_CHECKOUT_BRANCH: "git.checkout_branch",
  GIT_COMMIT: "git.commit",
  COMMAND_EXECUTE: "command.execute",
};

export const OPERATION_TO_TOOL_MAP = {
  [STRUCTURED_OPERATIONS.FILESYSTEM_READ]: RUNTIME_TOOLS.READ_FILE,
  [STRUCTURED_OPERATIONS.FILESYSTEM_WRITE]: RUNTIME_TOOLS.WRITE_FILE,
  [STRUCTURED_OPERATIONS.FILESYSTEM_LIST]: RUNTIME_TOOLS.LIST_DIRECTORY,
  [STRUCTURED_OPERATIONS.FILESYSTEM_MKDIR]: RUNTIME_TOOLS.CREATE_FILE,
  [STRUCTURED_OPERATIONS.FILESYSTEM_DELETE]: RUNTIME_TOOLS.DELETE_FILE,
  [STRUCTURED_OPERATIONS.FILESYSTEM_EXISTS]: RUNTIME_TOOLS.READ_FILE,
  [STRUCTURED_OPERATIONS.FILESYSTEM_STAT]: RUNTIME_TOOLS.READ_FILE,
  [STRUCTURED_OPERATIONS.GIT_IS_REPO]: RUNTIME_TOOLS.GIT_STATUS,
  [STRUCTURED_OPERATIONS.GIT_STATUS]: RUNTIME_TOOLS.GIT_STATUS,
  [STRUCTURED_OPERATIONS.GIT_DIFF]: RUNTIME_TOOLS.GIT_DIFF,
  [STRUCTURED_OPERATIONS.GIT_BRANCHES]: RUNTIME_TOOLS.GIT_BRANCH,
  [STRUCTURED_OPERATIONS.GIT_CURRENT_BRANCH]: RUNTIME_TOOLS.GIT_BRANCH,
  [STRUCTURED_OPERATIONS.GIT_LOG]: RUNTIME_TOOLS.GIT_LOG,
  [STRUCTURED_OPERATIONS.GIT_CREATE_BRANCH]: RUNTIME_TOOLS.GIT_BRANCH,
  [STRUCTURED_OPERATIONS.GIT_CHECKOUT_BRANCH]: RUNTIME_TOOLS.GIT_CHECKOUT,
  [STRUCTURED_OPERATIONS.GIT_COMMIT]: RUNTIME_TOOLS.GIT_COMMIT,
  [STRUCTURED_OPERATIONS.COMMAND_EXECUTE]: RUNTIME_TOOLS.EXECUTE_COMMAND,
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
    .replace(/(ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[a-zA-Z0-9_]{16,}/gi, "[REDACTED_GITHUB_PAT]")
    .replace(/(sk-[a-zA-Z0-9]{20,})/g, "sk-***[REDACTED]***")
    .replace(/(AIzaSy[a-zA-Z0-9_-]{33})/g, "AIzaSy***[REDACTED]***")
    .replace(/(Bearer\s+[a-zA-Z0-9._-]{20,})/gi, "Bearer ***[REDACTED]***");
}

/**
 * Construct a structured runtime request object
 * @param {string} operation
 * @param {Object} payload
 * @param {string} [workspaceId]
 * @returns {Object} Structured request
 */
export function createRuntimeRequest(operation, payload = {}, workspaceId = "default") {
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    operation,
    workspaceId,
    payload,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate a runtime request structure
 * @param {Object} request
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRuntimeRequest(request) {
  if (!request || typeof request !== "object") {
    return { valid: false, error: "Request payload must be a non-null object" };
  }

  if (!request.id || typeof request.id !== "string") {
    return { valid: false, error: "Request missing valid string 'id'" };
  }

  if (!request.operation || !Object.values(STRUCTURED_OPERATIONS).includes(request.operation)) {
    return { valid: false, error: `Request operation '${request.operation}' is unknown or invalid` };
  }

  if (typeof request.payload !== "object" || request.payload === null) {
    return { valid: false, error: "Request missing valid payload object" };
  }

  return { valid: true };
}

/**
 * Construct a structured runtime response object
 * @param {string} id
 * @param {boolean} success
 * @param {any} [data]
 * @param {Object} [error]
 * @returns {Object} Structured response
 */
export function createRuntimeResponse(id, success, data = null, error = null) {
  return {
    id,
    success: Boolean(success),
    data: success ? data : null,
    error: success ? null : error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate a runtime response structure
 * @param {Object} response
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRuntimeResponse(response) {
  if (!response || typeof response !== "object") {
    return { valid: false, error: "Response payload must be a non-null object" };
  }

  if (!response.id || typeof response.id !== "string") {
    return { valid: false, error: "Response missing valid string 'id'" };
  }

  if (typeof response.success !== "boolean") {
    return { valid: false, error: "Response missing valid boolean 'success'" };
  }

  return { valid: true };
}

export default {
  RUNTIME_COMMAND_LEVELS,
  RUNTIME_TOOLS,
  STRUCTURED_OPERATIONS,
  OPERATION_TO_TOOL_MAP,
  classifyCommand,
  validateWorkspacePath,
  redactSecrets,
  createRuntimeRequest,
  validateRuntimeRequest,
  createRuntimeResponse,
  validateRuntimeResponse,
};
