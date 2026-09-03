import { exec } from "child_process";
import { promisify } from "util";
import { classifyCommand, COMMAND_RISK_LEVELS, redactSecrets } from "../security/commandPolicy.js";

const execAsync = promisify(exec);

export async function executeCommandTool(command, workspacePath, options = {}) {
  const startTime = performance.now();
  const classification = classifyCommand(command);

  if (classification.level === COMMAND_RISK_LEVELS.BLOCKED) {
    return {
      success: false,
      exitCode: 126,
      stdout: "",
      stderr: `[Command Guard] ${classification.reason}`,
      durationMs: 0,
      requiresApproval: false,
    };
  }

  if (classification.level === COMMAND_RISK_LEVELS.APPROVAL_REQUIRED && !options.userApproved) {
    return {
      success: false,
      requiresApproval: true,
      reason: classification.reason,
      stdout: "",
      stderr: `[Tool Gateway] User approval required: ${classification.reason}`,
      durationMs: 0,
    };
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: workspacePath,
      timeout: options.timeout || 30000,
      maxBuffer: 1024 * 1024, // 1MB buffer limit
      env: { ...process.env },
    });

    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      exitCode: 0,
      stdout: redactSecrets(stdout),
      stderr: redactSecrets(stderr),
      durationMs,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      exitCode: err.code || 1,
      stdout: redactSecrets(err.stdout || ""),
      stderr: redactSecrets(err.stderr || err.message),
      durationMs,
    };
  }
}
