/**
 * @file runtimeCapabilities.js
 * @description Capability Discovery & State Manager for V1.3 Local Agent Runtime.
 */

export const DEFAULT_RUNTIME_CAPABILITIES = {
  connected: false,
  mode: "BROWSER_MODE", // BROWSER_MODE | LOCAL_RUNTIME_MODE
  version: "1.3.0-gateway",
  workspacePath: "D:\\coding\\AI-Engineer-OS",
  capabilities: {
    filesystem: true,
    terminal: true,
    git: true,
    node: true,
    npm: true,
    tests: true,
    build: true,
  },
  lastHeartbeat: null,
};

class RuntimeCapabilitiesManager {
  constructor() {
    this.state = { ...DEFAULT_RUNTIME_CAPABILITIES };
  }

  /** Get active capabilities snapshot */
  getCapabilities() {
    return { ...this.state };
  }

  /** Update runtime connection state */
  setConnected(isConnected, details = {}) {
    this.state = {
      ...this.state,
      connected: Boolean(isConnected),
      mode: isConnected ? "LOCAL_RUNTIME_MODE" : "BROWSER_MODE",
      workspacePath: details.workspacePath || this.state.workspacePath,
      lastHeartbeat: Date.now(),
    };
  }
}

export const runtimeCapabilities = new RuntimeCapabilitiesManager();
export default runtimeCapabilities;
