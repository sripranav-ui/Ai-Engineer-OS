import test from "node:test";
import assert from "node:assert";
import http from "node:http";
import { createServer } from "../src/server.js";
import tokenAuth from "../src/security/tokenAuth.js";

function makeRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {
          // Non-JSON response
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body, json });
      });
    });

    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

test("Runtime Server Security Integration Suite", async (t) => {
  const server = createServer(process.cwd());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const rawToken = tokenAuth._getRawTokenForTestingOnly();

  t.after(() => {
    server.close();
  });

  await t.test("Missing authentication returns 401 Unauthorized", async () => {
    const res = await makeRequest(`${baseUrl}/api/tools/execute`, {
      method: "POST",
      body: JSON.stringify({ toolName: "git_status" }),
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.json.ok, false);
    assert.strictEqual(res.json.error, "Unauthorized");
  });

  await t.test("Invalid authentication token returns 401 Unauthorized", async () => {
    const res = await makeRequest(`${baseUrl}/api/tools/execute`, {
      method: "POST",
      headers: { Authorization: "Bearer wrong_token" },
      body: JSON.stringify({ toolName: "git_status" }),
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.json.ok, false);
  });

  await t.test("Valid authentication token is accepted", async () => {
    const res = await makeRequest(`${baseUrl}/api/tools/execute`, {
      method: "POST",
      headers: { "x-runtime-token": rawToken },
      body: JSON.stringify({ toolName: "git_status" }),
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.ok, true);
  });

  await t.test("Path traversal attempt in tool execution returns 400 Bad Request", async () => {
    const res = await makeRequest(`${baseUrl}/api/tools/execute`, {
      method: "POST",
      headers: { Authorization: `Bearer ${rawToken}` },
      body: JSON.stringify({ toolName: "read_file", args: { path: "../secret.txt" } }),
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.json.ok, false);
    assert.ok(res.json.error.includes("Security Guard"));
  });

  await t.test("Unauthorized CORS origin returns 403 Forbidden", async () => {
    const res = await makeRequest(`${baseUrl}/health`, {
      headers: { Origin: "http://attacker.com" },
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.json.ok, false);
    assert.strictEqual(res.json.error, "CORS origin forbidden");
  });

  await t.test("Authorized localhost CORS origins return permissive header", async () => {
    const res5173 = await makeRequest(`${baseUrl}/health`, {
      headers: { Origin: "http://localhost:5173" },
    });
    assert.strictEqual(res5173.statusCode, 200);
    assert.strictEqual(res5173.headers["access-control-allow-origin"], "http://localhost:5173");

    const res127 = await makeRequest(`${baseUrl}/health`, {
      headers: { Origin: "http://127.0.0.1:5173" },
    });
    assert.strictEqual(res127.statusCode, 200);
    assert.strictEqual(res127.headers["access-control-allow-origin"], "http://127.0.0.1:5173");
  });

  await t.test("Unsupported HTTP method returns 405 Method Not Allowed", async () => {
    const res = await makeRequest(`${baseUrl}/health`, { method: "DELETE" });
    assert.strictEqual(res.statusCode, 405);
    assert.strictEqual(res.json.ok, false);
  });

  await t.test("Unknown route returns 404 Not Found", async () => {
    const res = await makeRequest(`${baseUrl}/invalid-endpoint`);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.json.ok, false);
  });

  await t.test("Malformed JSON body returns 400 Bad Request", async () => {
    const res = await makeRequest(`${baseUrl}/api/tools/execute`, {
      method: "POST",
      headers: { Authorization: `Bearer ${rawToken}`, "Content-Type": "application/json" },
      body: "invalid json string {{{",
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.json.ok, false);
  });
});
