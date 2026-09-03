import fs from "fs/promises";
import path from "path";
import { validateWorkspacePath } from "../security/workspaceGuard.js";

export async function readFileTool(targetPath, workspacePath) {
  const guard = validateWorkspacePath(targetPath, workspacePath);
  if (!guard.valid) throw new Error(guard.error);

  const content = await fs.readFile(guard.canonicalPath, "utf-8");
  return { path: guard.relativePath, content };
}

export async function writeFileTool(targetPath, content, workspacePath) {
  const guard = validateWorkspacePath(targetPath, workspacePath);
  if (!guard.valid) throw new Error(guard.error);

  await fs.mkdir(path.dirname(guard.canonicalPath), { recursive: true });
  await fs.writeFile(guard.canonicalPath, content || "", "utf-8");
  return { path: guard.relativePath, bytesWritten: (content || "").length };
}

export async function deleteFileTool(targetPath, workspacePath) {
  const guard = validateWorkspacePath(targetPath, workspacePath);
  if (!guard.valid) throw new Error(guard.error);

  await fs.unlink(guard.canonicalPath);
  return { path: guard.relativePath, deleted: true };
}

export async function listDirectoryTool(targetPath = ".", workspacePath) {
  const guard = validateWorkspacePath(targetPath, workspacePath);
  if (!guard.valid) throw new Error(guard.error);

  const entries = await fs.readdir(guard.canonicalPath, { withFileTypes: true });
  return {
    path: guard.relativePath,
    entries: entries.map((e) => ({
      name: e.name,
      isDirectory: e.isDirectory(),
    })),
  };
}
