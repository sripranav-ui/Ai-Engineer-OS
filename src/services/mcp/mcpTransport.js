/**
 * @file mcpTransport.js
 * @description Abstract transport interface for Model Context Protocol communication.
 */

export class BaseMCPTransport {
  constructor({ serverUri }) {
    if (!serverUri) throw new Error("MCP Transport requires 'serverUri'.");
    this.serverUri = serverUri;
    this.connected = false;
  }

  async connect() {
    throw new Error("connect() not implemented for BaseMCPTransport.");
  }

  async disconnect() {
    throw new Error("disconnect() not implemented for BaseMCPTransport.");
  }

  async sendRequest(method, params = {}) {
    throw new Error("sendRequest() not implemented for BaseMCPTransport.");
  }
}

export default BaseMCPTransport;
