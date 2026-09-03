import path from "node:path";
import { createServer } from "./server.js";
import tokenAuth from "./security/tokenAuth.js";

const PORT = process.env.PORT || 7070;
const HOST = "127.0.0.1";
const workspacePath = path.resolve(process.cwd());

const server = createServer(workspacePath);

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`AI Engineer OS Native Runtime`);
  console.log(`Version: 1.6.0`);
  console.log(`Host: ${HOST}`);
  console.log(`Port: ${PORT}`);
  console.log(`Workspace: ${workspacePath}`);
  console.log(`Token: ${tokenAuth.getMaskedToken()}`);
  console.log(`Status: READY`);
  console.log(`=======================================================`);
});

// STEP 9: Graceful Shutdown Handling
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down AI Engineer OS Native Runtime...`);
  server.close(() => {
    console.log(`AI Engineer OS Native Runtime server closed cleanly.`);
    process.exit(0);
  });

  // Force shutdown if server doesn't close within 3s
  setTimeout(() => {
    console.error(`Forced shutdown after timeout.`);
    process.exit(1);
  }, 3000).unref();
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

export { server };

