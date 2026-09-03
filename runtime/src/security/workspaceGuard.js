import path from "path";
import fs from "fs";

/**
 * Validate path stays within designated workspace boundary
 * @param {string} targetPath
 * @param {string} workspacePath
 * @returns {{ valid: boolean, canonicalPath?: string, error?: string }}
 */
export function validateWorkspacePath(targetPath = "", workspacePath = process.cwd()) {
  if (!targetPath) {
    return { valid: false, error: "Empty path specified" };
  }

  // Reject explicit traversal strings
  if (targetPath.includes("../") || targetPath.includes("..\\")) {
    return { valid: false, error: "Path traversal attempt ('../') rejected by Workspace Guard" };
  }

  const resolvedWorkspace = path.resolve(workspacePath);
  const resolvedTarget = path.resolve(resolvedWorkspace, targetPath);

  // Check prefix containment
  if (!resolvedTarget.toLowerCase().startsWith(resolvedWorkspace.toLowerCase())) {
    return { valid: false, error: `Path escapes active workspace boundary (${resolvedWorkspace})` };
  }

  return {
    valid: true,
    canonicalPath: resolvedTarget,
    relativePath: path.relative(resolvedWorkspace, resolvedTarget),
  };
}
