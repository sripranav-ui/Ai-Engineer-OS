import path from "node:path";
import fs from "node:fs";

/**
 * Get canonical real path of a target path or its deepest existing parent directory
 * @param {string} targetPath
 * @returns {string}
 */
function getCanonicalPath(targetPath) {
  const normalized = path.normalize(targetPath);
  if (fs.existsSync(normalized)) {
    try {
      return fs.realpathSync(normalized);
    } catch {
      return path.resolve(normalized);
    }
  }

  // If path does not exist yet, find deepest existing parent
  let current = path.dirname(normalized);
  while (current && current !== path.dirname(current)) {
    if (fs.existsSync(current)) {
      try {
        const canonicalParent = fs.realpathSync(current);
        const relativeRemainder = path.relative(current, normalized);
        return path.resolve(canonicalParent, relativeRemainder);
      } catch {
        break;
      }
    }
    current = path.dirname(current);
  }

  return path.resolve(normalized);
}

/**
 * Validate path stays within designated workspace boundary
 * @param {string} targetPath
 * @param {string} [workspacePath]
 * @returns {{ valid: boolean, canonicalPath?: string, relativePath?: string, error?: string }}
 */
export function validateWorkspacePath(targetPath = "", workspacePath = process.cwd()) {
  if (!targetPath || typeof targetPath !== "string") {
    return { valid: false, error: "Empty or invalid path parameter specified" };
  }

  // Reject URL-encoded traversal patterns
  let decodedPath = targetPath;
  try {
    decodedPath = decodeURIComponent(targetPath);
  } catch {
    return { valid: false, error: "Malformed encoded path parameter" };
  }

  // Reject explicit path traversal sequences
  if (decodedPath.includes("../") || decodedPath.includes("..\\") || decodedPath.includes("..")) {
    const parts = decodedPath.split(/[/\\]/);
    if (parts.includes("..")) {
      return { valid: false, error: "Path traversal attempt ('..') rejected by Workspace Guard" };
    }
  }

  let canonicalWorkspace;
  try {
    canonicalWorkspace = fs.existsSync(workspacePath)
      ? fs.realpathSync(workspacePath)
      : path.resolve(workspacePath);
  } catch {
    canonicalWorkspace = path.resolve(workspacePath);
  }

  const rawTarget = path.resolve(canonicalWorkspace, decodedPath);
  const canonicalTarget = getCanonicalPath(rawTarget);

  // Containment check via path.relative()
  const relative = path.relative(canonicalWorkspace, canonicalTarget);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return {
      valid: false,
      error: `Path escapes active workspace boundary (${canonicalWorkspace})`,
    };
  }

  // Double check prefix containment with trailing path separator guard
  const normalizedWorkspace = canonicalWorkspace.toLowerCase().replace(/[/\\]+$/, "");
  const normalizedTarget = canonicalTarget.toLowerCase();

  const isExactRoot = normalizedTarget === normalizedWorkspace;
  const isSubPath =
    normalizedTarget.startsWith(normalizedWorkspace + path.sep.toLowerCase()) ||
    normalizedTarget.startsWith(normalizedWorkspace + "/");

  if (!isExactRoot && !isSubPath) {
    return {
      valid: false,
      error: `Path escapes active workspace boundary via prefix attack (${canonicalWorkspace})`,
    };
  }

  return {
    valid: true,
    canonicalPath: canonicalTarget,
    relativePath: path.relative(canonicalWorkspace, canonicalTarget),
  };
}

/**
 * Resolve workspace path safely or throw security error
 * @param {string} workspacePath
 * @param {string} targetPath
 * @returns {string}
 */
export function resolveWorkspacePath(workspacePath, targetPath) {
  const result = validateWorkspacePath(targetPath, workspacePath);
  if (!result.valid) {
    throw new Error(`[Security Violation] ${result.error}`);
  }
  return result.canonicalPath;
}

export default {
  validateWorkspacePath,
  resolveWorkspacePath,
};

