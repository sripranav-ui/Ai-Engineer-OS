export const COMMAND_RISK_LEVELS = {
  SAFE: "SAFE",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  BLOCKED: "BLOCKED",
};

const BLOCKED_PATTERNS = [
  { pattern: /rm\s+-rf\s+(\/|\*|~\/)/i, reason: "Recursive root/home deletion" },
  { pattern: /rmdir\s+\/s\s+\/q\s+[c-z]:\\/i, reason: "Recursive disk deletion" },
  { pattern: /\b(format|mkfs|fdisk)\b/i, reason: "Disk formatting" },
  { pattern: /\b(shutdown|reboot|init\s+0)\b/i, reason: "System shutdown/reboot" },
  { pattern: /git\s+(reset\s+--hard|clean\s+-fd|checkout\s+--\s+\.|restore\s+\.)/i, reason: "Destructive git operation that deletes uncommitted work" },
  { pattern: /git\s+push\s+.*(--force|-f)/i, reason: "Force pushing to remote repository" },
  { pattern: /(curl|wget)\s+.*\|\s*(sh|bash|powershell|cmd)/i, reason: "Unsafe remote script execution" },
  { pattern: /(sudo\s+su|chmod\s+-R\s+777\s+\/)/i, reason: "Privilege escalation" },
];

const APPROVAL_PATTERNS = [
  { pattern: /npm\s+(install|i|uninstall|remove|publish)\b/i, reason: "Dependency package modification" },
  { pattern: /git\s+(branch\s+[\w\-\/]+|checkout|switch|add|commit|push|merge|rebase|cherry-pick)\b/i, reason: "Git version control state modification" },
  { pattern: /docker\s+(run|rm|system\s+prune)\b/i, reason: "Container environment modification" },
];

const SAFE_GIT_PATTERNS = [
  /^git\s+status(\s+.*)?$/i,
  /^git\s+diff(\s+.*)?$/i,
  /^git\s+log(\s+.*)?$/i,
  /^git\s+branch(\s+--list|\s+-a|\s+-r)?$/i,
  /^git\s+rev-parse(\s+.*)?$/i,
  /^git\s+remote\s+-v$/i,
];

/**
 * Classify CLI command safety
 * @param {string} command
 * @returns {{ level: string, reason?: string }}
 */
export function classifyCommand(command = "") {
  const trimmed = command.trim();
  if (!trimmed) {
    return { level: COMMAND_RISK_LEVELS.BLOCKED, reason: "Empty command string" };
  }

  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return { level: COMMAND_RISK_LEVELS.BLOCKED, reason: `Blocked: ${rule.reason}` };
    }
  }

  // Check if it's explicitly a safe git command
  if (trimmed.startsWith("git ")) {
    const isSafeGit = SAFE_GIT_PATTERNS.some((p) => p.test(trimmed));
    if (isSafeGit) {
      return { level: COMMAND_RISK_LEVELS.SAFE };
    }
  }

  for (const rule of APPROVAL_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return { level: COMMAND_RISK_LEVELS.APPROVAL_REQUIRED, reason: `Approval required: ${rule.reason}` };
    }
  }

  return { level: COMMAND_RISK_LEVELS.SAFE };
}

/**
 * Redact secret tokens and keys from logs
 * @param {string} text
 * @returns {string}
 */
export function redactSecrets(text = "") {
  if (typeof text !== "string") return text;
  return text
    .replace(/(runtime_tok_[a-f0-9]{20,})/gi, "[REDACTED]")
    .replace(/(ghp_[a-zA-Z0-9]{36,})/g, "ghp_***[REDACTED]***")
    .replace(/(github_pat_[a-zA-Z0-9_]{22,})/g, "github_pat_***[REDACTED]***")
    .replace(/(sk-[a-zA-Z0-9]{20,})/g, "sk-***[REDACTED]***")
    .replace(/(AIzaSy[a-zA-Z0-9_-]{33})/g, "AIzaSy***[REDACTED]***")
    .replace(/(Bearer\s+[a-zA-Z0-9._-]{20,})/gi, "Bearer ***[REDACTED]***");
}
