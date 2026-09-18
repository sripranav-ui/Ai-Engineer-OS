import http from "node:http";
import path from "node:path";
import tokenAuth from "./security/tokenAuth.js";
import { probeCapabilities } from "./tools/capabilityProbe.js";
import { readFileTool, writeFileTool, deleteFileTool, listDirectoryTool } from "./tools/filesystem.js";
import { executeCommandTool } from "./tools/terminal.js";
import { gitStatusTool, gitDiffTool, gitLogTool, gitBranchTool, gitCheckoutTool, gitAddTool, gitCommitTool } from "./tools/git.js";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export function createServer(workspacePath = process.cwd()) {
  const resolvedWorkspace = path.resolve(workspacePath);

  const server = http.createServer(async (req, res) => {
    // ----------------------------------------------------
    // STEP 3: CORS Guard & Origin Check
    // ----------------------------------------------------
    const origin = req.headers["origin"];
    if (origin) {
      if (!ALLOWED_ORIGINS.has(origin)) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "CORS origin forbidden" }));
        return;
      }
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-runtime-token");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const host = req.headers.host || "127.0.0.1:7070";
    const url = new URL(req.url, `http://${host}`);

    // ----------------------------------------------------
    // STEP 2: GET /health (Unauthenticated Status Check)
    // ----------------------------------------------------
    if (url.pathname === "/health") {
      if (req.method !== "GET") {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
        return;
      }

      const capabilities = await probeCapabilities(resolvedWorkspace);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          version: "1.6.0",
          workspaceRoot: resolvedWorkspace,
          token: "[REDACTED]",
          capabilities,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    // ----------------------------------------------------
    // Tool Execution Endpoint: POST /api/tools/execute
    // ----------------------------------------------------
    if (url.pathname === "/api/tools/execute") {
      if (req.method !== "POST") {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
        return;
      }

      // STEP 7 & 8: Token Authentication Guard for Protected Endpoints
      const reqToken = req.headers["x-runtime-token"] || req.headers["authorization"];
      if (!tokenAuth.validateToken(reqToken)) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
        return;
      }

      let bodyStr = "";
      req.on("data", (chunk) => {
        bodyStr += chunk;
      });

      req.on("end", async () => {
        try {
          let body = {};
          try {
            body = JSON.parse(bodyStr || "{}");
          } catch {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Bad Request: Invalid JSON body" }));
            return;
          }

          const { toolName, args = {}, userApproved = false } = body;
          if (!toolName) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Bad Request: Missing toolName" }));
            return;
          }

          // Security Gate: Validate Workspace Path for file tools
          const targetFilePath = args.path || args.filePath;
          if (["read_file", "write_file", "create_file", "delete_file", "list_directory"].includes(toolName)) {
            const { validateWorkspacePath } = await import("./security/workspaceGuard.js");
            const pathCheck = validateWorkspacePath(targetFilePath || ".", resolvedWorkspace);
            if (!pathCheck.valid) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: false, error: `Security Guard: ${pathCheck.error}` }));
              return;
            }
          }

          let result = null;
          switch (toolName) {
            case "read_file":
              result = await readFileTool(args.path, resolvedWorkspace);
              break;

            case "write_file":
            case "create_file":
              result = await writeFileTool(args.path || args.filePath, args.content, resolvedWorkspace);
              break;

            case "delete_file":
              result = await deleteFileTool(args.path, resolvedWorkspace);
              break;

            case "list_directory":
              result = await listDirectoryTool(args.path || ".", resolvedWorkspace);
              break;

            case "execute_command":
              result = await executeCommandTool(args.command, resolvedWorkspace, { userApproved });
              break;

            case "run_tests":
              result = await executeCommandTool("npm test", resolvedWorkspace, { userApproved });
              break;

            case "run_build":
              result = await executeCommandTool("npm run build", resolvedWorkspace, { userApproved });
              break;

            case "git_status":
              result = await gitStatusTool(resolvedWorkspace);
              break;

            case "git_diff":
              result = await gitDiffTool(resolvedWorkspace);
              break;

            case "git_log":
              result = await gitLogTool(resolvedWorkspace);
              break;

            case "git_branch":
              result = await gitBranchTool(resolvedWorkspace);
              break;

            case "git_checkout":
              result = await gitCheckoutTool(resolvedWorkspace, args.branchName, args.createNew);
              break;

            case "git_add":
              result = await gitAddTool(resolvedWorkspace, args.files);
              break;

            case "git_commit":
              result = await gitCommitTool(resolvedWorkspace, args.message);
              break;

            default:
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: false, error: `Bad Request: Unknown tool ${toolName}` }));
              return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, success: true, toolName, result }));
        } catch {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "Internal Server Error" }));
        }
      });
      return;
    }

    // ----------------------------------------------------
    // STEP 8: 404 Not Found
    // ----------------------------------------------------
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Not Found" }));
  });

  return server;
}

export default createServer;

