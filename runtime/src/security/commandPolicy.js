export const COMMAND_RISK_LEVELS = {
  SAFE: "SAFE",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  BLOCKED: "BLOCKED",
};

/** Destructive command patterns blocked automatically */
const BLOCKED_PATTERNS = [
  { pattern: /\bgit\s+(reset\s+--(hard|merge|keep)|clean\s+-(fd|xdf|f)|checkout\s+--\s+\.|restore\s+\.)/i, reason: "Destructive git operation that deletes uncommitted work" },
  { pattern: /\bgit\s+push\s+.*(--force|-f)/i, reason: "Force push operation rejected" },
  { pattern: /\b(del|rmdir|rd|format|Remove-Item)\b/i, reason: "Destructive Windows shell command" },
  { pattern: /\brm\s+-(rf|r|f)\s+(\/|\*|~\/|[a-z]:\\)/i, reason: "Recursive file system deletion" },
  { pattern: /\b(shutdown|reboot|init\s+0)\b/i, reason: "System shutdown command" },
  { pattern: /(curl|wget)\s+.*\|\s*(sh|bash|powershell|cmd)/i, reason: "Unsafe remote execution pipe" },
  { pattern: /\b(sudo\s+su|chmod\s+-R\s+777\s+\/)\b/i, reason: "Privilege escalation command" },
];

/** Operations requiring explicit user confirmation */
const APPROVAL_PATTERNS = [
  { pattern: /\bnpm\s+(install|i|uninstall|remove|publish)\b/i, reason: "Dependency package modification" },
  { pattern: /\bgit\s+(branch\s+[\w\-\/]+|checkout|switch|add|commit|push|merge|rebase|cherry-pick)\b/i, reason: "Git version control state modification" },
  { pattern: /\bdocker\s+(run|rm|system\s+prune)\b/i, reason: "Container environment modification" },
  { pattern: /\bpip\s+(install|uninstall)\b/i, reason: "Python package modification" },
];

/** Explicit safe read-only git patterns */
const SAFE_GIT_PATTERNS = [
  /^git\s+status(\s+.*)?$/i,
  /^git\s+diff(\s+.*)?$/i,
  /^git\s+log(\s+.*)?$/i,
  /^git\s+branch(\s+--list|\s+-a|\s+-r)?$/i,
  /^git\s+rev-parse(\s+.*)?$/i,
  /^git\s+remote\s+-v$/i,
];

/** Shell chaining and injection operators */
const SHELL_OPERATOR_PATTERN = /(&&|;|\||>|\$\(|`)/;

/**
 * Classify a single command string
 * @param {string} command
 * @returns {{ level: string, reason?: string }}
 */
export function classifySingleCommand(command = "") {
  const trimmed = command.trim();
  if (!trimmed) {
    return { level: COMMAND_RISK_LEVELS.BLOCKED, reason: "Empty command string" };
  }

  // Check BLOCKED patterns first
  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return { level: COMMAND_RISK_LEVELS.BLOCKED, reason: `Blocked: ${rule.reason}` };
    }
  }

  // Check if it's explicitly a safe read-only git command
  if (/^git\s+/i.test(trimmed)) {
    const isSafeGit = SAFE_GIT_PATTERNS.some((p) => p.test(trimmed));
    if (isSafeGit) {
      return { level: COMMAND_RISK_LEVELS.SAFE, reason: "Safe read-only Git command" };
    }
  }

  // Check APPROVAL_REQUIRED patterns
  for (const rule of APPROVAL_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return { level: COMMAND_RISK_LEVELS.APPROVAL_REQUIRED, reason: `Approval required: ${rule.reason}` };
    }
  }

  // Default to SAFE for standard benign local commands unless blocked
  return { level: COMMAND_RISK_LEVELS.SAFE, reason: "Standard execution command" };
}

/**
 * Classify CLI command safety including shell chaining & injection protection
 * @param {string} command
 * @returns {{ level: string, reason?: string, allowed?: boolean }}
 */
export function classifyCommand(command = "") {
  const trimmed = command.trim();
  if (!trimmed) {
    return { allowed: false, level: COMMAND_RISK_LEVELS.BLOCKED, reason: "Empty command string" };
  }

  // Check overall command string for BLOCKED patterns first
  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(trimmed)) {
      return { allowed: false, level: COMMAND_RISK_LEVELS.BLOCKED, reason: `Blocked: ${rule.reason}` };
    }
  }

  // If command contains shell chaining/injection operators, inspect chained subcommands
  if (SHELL_OPERATOR_PATTERN.test(trimmed)) {
    const subcommands = trimmed
      .split(/&&|;|\||>|\$\(|`/)
      .map((s) => s.replace(/[\)`]/g, "").trim())
      .filter(Boolean);

    let maxRisk = COMMAND_RISK_LEVELS.SAFE;
    let highestReason = "Shell operators present in command chain";

    for (const sub of subcommands) {
      const res = classifySingleCommand(sub);
      if (res.level === COMMAND_RISK_LEVELS.BLOCKED) {
        return {
          allowed: false,
          level: COMMAND_RISK_LEVELS.BLOCKED,
          reason: `Blocked chained command segment: ${res.reason}`,
        };
      }
      if (res.level === COMMAND_RISK_LEVELS.APPROVAL_REQUIRED) {
        maxRisk = COMMAND_RISK_LEVELS.APPROVAL_REQUIRED;
        highestReason = res.reason;
      }
    }

    if (maxRisk === COMMAND_RISK_LEVELS.APPROVAL_REQUIRED) {
      return { allowed: false, level: COMMAND_RISK_LEVELS.APPROVAL_REQUIRED, reason: highestReason };
    }

    return { allowed: true, level: COMMAND_RISK_LEVELS.SAFE, reason: "Safe chained shell execution" };
  }

  const res = classifySingleCommand(trimmed);
  return {
    allowed: res.level !== COMMAND_RISK_LEVELS.BLOCKED,
    level: res.level,
    reason: res.reason,
  };
}

/**
 * Redact secret tokens, keys, and credentials from logs or output
 * @param {string} text
 * @returns {string}
 */
export function redactSecrets(text = "") {
  if (typeof text !== "string" || !text) return text;
  return text
    .replace(/(runtime_tok_[a-f0-9]{20,})/gi, "[REDACTED]")
    .replace(/(ghp_[a-zA-Z0-9]{36,})/g, "[REDACTED]")
    .replace(/(github_pat_[a-zA-Z0-9_]{22,})/g, "[REDACTED]")
    .replace(/(sk-[a-zA-Z0-9]{20,})/g, "[REDACTED]")
    .replace(/(AIzaSy[a-zA-Z0-9_-]{33})/g, "[REDACTED]")
    .replace(/(Bearer\s+[a-zA-Z0-9._-]{20,})/gi, "Bearer [REDACTED]")
    .replace(/-----BEGIN (RSA |EC |PGP |DSA )?PRIVATE KEY-----[\s\S]*?-----END \1PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]");
}

export default {
  COMMAND_RISK_LEVELS,
  classifyCommand,
  redactSecrets,
};

