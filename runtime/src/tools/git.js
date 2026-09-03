import { executeCommandTool } from "./terminal.js";

export async function gitStatusTool(workspacePath) {
  const result = await executeCommandTool("git status --porcelain -b", workspacePath, { userApproved: true });
  if (!result.success) return result;

  const lines = (result.stdout || "").split("\n").filter(Boolean);
  let currentBranch = "main";
  const branchLine = lines.find((l) => l.startsWith("##"));
  if (branchLine) {
    const match = branchLine.match(/^##\s+([\w\-\/\.]+)/);
    if (match) currentBranch = match[1];
  }

  const modifiedFiles = lines
    .filter((l) => !l.startsWith("##"))
    .map((l) => {
      const status = l.substring(0, 2).trim();
      const path = l.substring(3).trim();
      return { status, path };
    });

  return {
    success: true,
    currentBranch,
    isDirty: modifiedFiles.length > 0,
    uncommittedChanges: modifiedFiles,
    rawOutput: result.stdout,
  };
}

export async function gitDiffTool(workspacePath) {
  const diffResult = await executeCommandTool("git diff", workspacePath, { userApproved: true });
  const statResult = await executeCommandTool("git diff --stat", workspacePath, { userApproved: true });
  const stagedResult = await executeCommandTool("git diff --staged", workspacePath, { userApproved: true });

  return {
    success: diffResult.success,
    rawDiff: diffResult.stdout || stagedResult.stdout || "",
    diffStat: statResult.stdout || "",
    hasDiff: Boolean((diffResult.stdout || stagedResult.stdout || "").trim()),
  };
}

export async function gitLogTool(workspacePath) {
  return await executeCommandTool("git log -n 10 --oneline", workspacePath, { userApproved: true });
}

export async function gitBranchTool(workspacePath) {
  const currentBranchResult = await executeCommandTool("git rev-parse --abbrev-ref HEAD", workspacePath, { userApproved: true });
  const branchListResult = await executeCommandTool("git branch --list -a", workspacePath, { userApproved: true });

  const currentBranch = (currentBranchResult.stdout || "main").trim();
  const branches = (branchListResult.stdout || "")
    .split("\n")
    .map((b) => b.replace(/^\*?\s+/, "").trim())
    .filter(Boolean);

  return {
    success: true,
    currentBranch,
    branches: Array.from(new Set([currentBranch, ...branches])),
  };
}

export async function gitCheckoutTool(workspacePath, branchName, createNew = false) {
  if (!branchName || typeof branchName !== "string") {
    return { success: false, error: "Invalid branch name provided." };
  }
  const sanitizedBranch = branchName.trim().replace(/[^a-zA-Z0-9\-\_\/]/g, "");
  const cmd = createNew ? `git checkout -b ${sanitizedBranch}` : `git checkout ${sanitizedBranch}`;
  return await executeCommandTool(cmd, workspacePath, { userApproved: true });
}

export async function gitAddTool(workspacePath, files = ".") {
  const targetFiles = Array.isArray(files) ? files.join(" ") : files;
  return await executeCommandTool(`git add ${targetFiles}`, workspacePath, { userApproved: true });
}

export async function gitCommitTool(workspacePath, message) {
  if (!message || typeof message !== "string") {
    return { success: false, error: "Commit message is required." };
  }
  const addResult = await executeCommandTool("git add .", workspacePath, { userApproved: true });
  if (!addResult.success) return addResult;

  const escapedMsg = message.replace(/"/g, '\\"');
  return await executeCommandTool(`git commit -m "${escapedMsg}"`, workspacePath, { userApproved: true });
}
