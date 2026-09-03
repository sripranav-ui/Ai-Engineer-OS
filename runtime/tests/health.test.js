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

test("Native Runtime Daemon - Phase 2 Health & Security Test Suite", async (t) => {
  const server = createServer(process.cwd());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    server.close();
  });

  await t.test("1. Server starts and binds to localhost", () => {
    assert.ok(port > 0);
  });

  await t.test("2-9. GET /health returns 200 OK with accurate metadata and redacted token", async () => {
    const res = await makeRequest(`${baseUrl}/health`);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.json, "Response must be valid JSON");
    assert.strictEqual(res.json.ok, true, "ok === true");
    assert.strictEqual(res.json.version, "1.6.0", "version === '1.6.0'");
    assert.ok(res.json.workspaceRoot, "workspaceRoot exists");
    assert.ok(res.json.capabilities, "capabilities exists");
    assert.strictEqual(res.json.token, "[REDACTED]", "token in response must be [REDACTED]");

    const rawToken = tokenAuth._getRawTokenForTestingOnly();
    assert.strictEqual(res.body.includes(rawToken), false, "Actual runtime token must NOT be present in response body");
  });

  await t.test("10. Unknown route returns 404", async () => {
    const res = await makeRequest(`${baseUrl}/nonexistent-route`);
    assert.strictEqual(res.statusCode, 404);
    assert.ok(res.json);
    assert.strictEqual(res.json.ok, false);
    assert.strictEqual(res.json.error, "Not Found");
  });

  await t.test("11. Unsupported HTTP method on /health returns 405", async () => {
    const res = await makeRequest(`${baseUrl}/health`, { method: "POST" });
    assert.strictEqual(res.statusCode, 405);
    assert.ok(res.json);
    assert.strictEqual(res.json.ok, false);
    assert.strictEqual(res.json.error, "Method Not Allowed");
  });

  await t.test("Protected route without token returns 401", async () => {
    const res = await makeRequest(`${baseUrl}/api/tools/execute`, { method: "POST" });
    assert.strictEqual(res.statusCode, 401);
    assert.ok(res.json);
    assert.strictEqual(res.json.ok, false);
    assert.strictEqual(res.json.error, "Unauthorized");
  });

  await t.test("CORS origin validation", async () => {
    const validRes = await makeRequest(`${baseUrl}/health`, {
      headers: { Origin: "http://localhost:5173" },
    });
    assert.strictEqual(validRes.statusCode, 200);
    assert.strictEqual(validRes.headers["access-control-allow-origin"], "http://localhost:5173");

    const invalidRes = await makeRequest(`${baseUrl}/health`, {
      headers: { Origin: "http://evil-attacker.com" },
    });
    assert.strictEqual(invalidRes.statusCode, 403);
    assert.strictEqual(invalidRes.json.ok, false);
  });
});

