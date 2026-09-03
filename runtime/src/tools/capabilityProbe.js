import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";

const execFileAsync = promisify(execFile);

/**
 * Dynamically probe host environment capabilities safely
 * @param {string} [workspacePath]
 * @returns {Promise<Object>}
 */
export async function probeCapabilities(workspacePath = process.cwd()) {
  let gitAvailable = false;
  try {
    const { stdout } = await execFileAsync("git", ["--version"]);
    if (stdout && stdout.toLowerCase().includes("git")) {
      gitAvailable = true;
    }
  } catch {
    gitAvailable = false;
  }

  let filesystemAvailable = false;
  try {
    fs.accessSync(workspacePath, fs.constants.R_OK | fs.constants.W_OK);
    filesystemAvailable = true;
  } catch {
    filesystemAvailable = false;
  }

  return {
    node: process.version,
    platform: process.platform,
    gitAvailable,
    filesystemAvailable,
    runtimeVersion: "1.6.0",
    workspaceRoot: path.resolve(workspacePath),
  };
}

export default probeCapabilities;

