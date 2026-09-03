/**
 * @file secretScanner.js
 * @description Secret Scanning Guard for AI Engineer OS V1.6.
 * Scans Git diffs and changed files for potential secrets and API keys prior to commit.
 */

const SECRET_PATTERNS = [
  { name: "GitHub Personal Access Token", regex: /ghp_[a-zA-Z0-9]{36}/ },
  { name: "GitHub Fine-Grained Token", regex: /github_pat_[a-zA-Z0-9_]{22,}/ },
  { name: "OpenAI API Key", regex: /sk-[a-zA-Z0-9]{32,}/ },
  { name: "Anthropic API Key", regex: /sk-ant-api03-[a-zA-Z0-9_-]{32,}/ },
  { name: "Google API Key", regex: /AIzaSy[a-zA-Z0-9_-]{33}/ },
  { name: "RSA/EC Private Key", regex: /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/ },
  { name: "AWS Secret Access Key", regex: /(aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*=\s*['"][a-zA-Z0-9\/+=]{40}['"]/ },
  { name: "Generic Secret String", regex: /(api_key|secret_key|private_key|auth_token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i },
];

const FORBIDDEN_FILES = [
  /\.env$/i,
  /\.env\.(local|production|development|test)$/i,
  /id_rsa$/i,
  /id_ed25519$/i,
  /credentials\.json$/i,
  /service-account.*\.json$/i,
];

export function scanForSecrets({ diffText = "", changedFiles = [] }) {
  const detectedSecrets = [];
  const detectedForbiddenFiles = [];

  // Check forbidden filenames
  for (const file of changedFiles) {
    const filePath = typeof file === "string" ? file : file.path || file.name || "";
    for (const pattern of FORBIDDEN_FILES) {
      if (pattern.test(filePath)) {
        detectedForbiddenFiles.push(filePath);
      }
    }
  }

  // Check diff text for secret patterns
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.regex.test(diffText)) {
      detectedSecrets.push(pattern.name);
    }
  }

  const passed = detectedSecrets.length === 0 && detectedForbiddenFiles.length === 0;

  return {
    passed,
    detectedSecrets,
    detectedForbiddenFiles,
    summary: passed
      ? "PASSED: No secrets or sensitive credential files detected."
      : `SECURITY BLOCK: Potential secret or forbidden file detected. Secrets: [${detectedSecrets.join(", ")}], Files: [${detectedForbiddenFiles.join(", ")}]`,
  };
}

export default scanForSecrets;
