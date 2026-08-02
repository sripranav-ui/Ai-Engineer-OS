// =======================================================
// app.js — Main Production Server Entry Point
// =======================================================

import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import globalErrorHandler from "./middlewares/errorHandler.js";
import { initWebSockets } from "./services/websocketService.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString(), service: "AI Engineer OS Backend Engine" });
});

// REST API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/ai", aiRoutes);

// Global Error Handler
app.use(globalErrorHandler);

// Initialize WebSockets
initWebSockets(server);

// Start Production HTTP & WS Server
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AI Engineer OS Enterprise Server running on port ${PORT}`);
    console.log(`📡 WebSocket Realtime Engine initialized`);
    console.log(`=======================================================`);
  });
}

export default app;
