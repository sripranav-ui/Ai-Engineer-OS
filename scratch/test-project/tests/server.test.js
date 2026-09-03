import assert from "assert";
import test from "node:test";
import { createServer } from "../src/server.js";

test("Health check endpoint returns 200 status OK", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  const res = await fetch(`http://127.0.0.1:${port}/health`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, "OK");

  server.close();
});
