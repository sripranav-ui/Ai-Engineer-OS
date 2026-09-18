/**
 * @file secretScanner.js
 * @description Commit-Scoped Secret Scanning Engine for AI Engineer OS.
 * Scans commit-relevant content (staged diffs, commit messages, changed files) for credentials.
 * NEVER outputs, logs, or returns raw secret values.
 */

const SECRET_PATTERNS = [
  { name: "OpenAI / Generic API Key", pattern: /sk-[a-zA-Z0-9_-]{20,}/g },
  { name: "Google Cloud API Key", pattern: /AIzaSy[a-zA-Z0-9_-]{33}/g },
  { name: "GitHub Personal Access Token", pattern: /(ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[a-zA-Z0-9_]{16,}/g },
  { name: "Bearer / JWT Token", pattern: /Bearer\s+[a-zA-Z0-9._-]{20,}/gi },
  { name: "JWT Token Header", pattern: /eyJhbGciOi[a-zA-Z0-9._-]{20,}/g },
  { name: "RSA / PGP Private Key", pattern: /-----BEGIN (RSA |EC |PGP |DSA )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |PGP |DSA )?PRIVATE KEY-----/g },
  { name: "AWS Access Key ID", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "AWS Secret Access Key", pattern: /aws_secret_access_key\s*=\s*['"]?[a-zA-Z0-9/+=]{30,}['"]?/gi },
  { name: "Database Connection String", pattern: /(mongodb(\+srv)?|postgres|mysql|redis):\/\/[^\s"']+/gi },
  { name: "Generic Password Assignment", pattern: /(password|passwd|secret_key|api_secret)\s*[:=]\s*['"]?[a-zA-Z0-9@#$%^&*!_-]{8,}['"]?/gi },
];

/**
 * Filter sensitive API keys and secrets from output logs and text
 * @param {string} text
 * @returns {string}
 */
export function redactSecrets(text = "") {
  if (typeof text !== "string") return text;
  let redacted = text;

  for (const rule of SECRET_PATTERNS) {
    redacted = redacted.replace(rule.pattern, `[REDACTED_${rule.name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}]`);
  }

  return redacted;
}

/**
 * Scan content string for secrets
 * @param {string} text
 * @param {string} [filename="commit_content"]
 * @returns {{ clean: boolean, count: number, findings: Array<{ type: string, filename: string }>, redactedText: string }}
 */
export function scanContent(text = "", filename = "commit_content") {
  if (typeof text !== "string" || !text.trim()) {
    return { clean: true, count: 0, findings: [], redactedText: "" };
  }

  const findings = [];

  for (const rule of SECRET_PATTERNS) {
    // Reset regex index
    rule.pattern.lastIndex = 0;
    const matches = text.match(rule.pattern);
    if (matches && matches.length > 0) {
      findings.push({
        type: rule.name,
        filename,
        matchCount: matches.length,
      });
    }
  }

  const clean = findings.length === 0;
  const count = findings.reduce((sum, f) => sum + f.matchCount, 0);
  const redactedText = redactSecrets(text);

  return {
    clean,
    count,
    findings,
    redactedText,
  };
}

/**
 * Scan staged diff content for secrets
 * @param {string} stagedDiff
 * @returns {{ clean: boolean, count: number, findings: Array, redactedText: string }}
 */
export function scanDiff(stagedDiff = "") {
  return scanContent(stagedDiff, "staged_diff");
}

export default {
  SECRET_PATTERNS,
  redactSecrets,
  scanContent,
  scanDiff,
};
