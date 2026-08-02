// =======================================================
// websocketService.js — Real-time WebSockets Manager
// =======================================================

import { WebSocketServer } from "ws";

const clientsMap = new Map();

export const initWebSockets = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const clientId = `client_${Date.now()}`;
    clientsMap.set(clientId, ws);
    console.log(`[WebSocket] Client connected: ${clientId}`);

    ws.send(JSON.stringify({ type: "CONNECTED", clientId, message: "Connected to AI Engineer OS Realtime Engine" }));

    ws.on("message", (message) => {
      try {
        const payload = JSON.parse(message);
        console.log(`[WebSocket] Received message from ${clientId}:`, payload);
      } catch (err) {
        console.error("[WebSocket] Message parsing error:", err);
      }
    });

    ws.on("close", () => {
      clientsMap.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
    });
  });

  return wss;
};

export const broadcastNotification = (type, data) => {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  clientsMap.forEach((ws) => {
    if (ws.readyState === 1) { // OPEN
      ws.send(message);
    }
  });
};

export default { initWebSockets, broadcastNotification };
