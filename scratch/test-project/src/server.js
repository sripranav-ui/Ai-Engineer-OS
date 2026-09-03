import http from "http";

export function createServer() {
  return http.createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "OK", timestamp: new Date().toISOString() }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
}
