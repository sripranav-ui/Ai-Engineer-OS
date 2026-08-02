// =======================================================
// baseAgent.js — Abstract Base Agent Foundation Class
// =======================================================

export class BaseAgent {
  constructor({ id, name, role, capabilities = [], permissions = [], version = "1.0.0" }) {
    if (!id || !name) {
      throw new Error("Agent construction requires 'id' and 'name'.");
    }
    this.id = id;
    this.name = name;
    this.role = role || "assistant";
    this.capabilities = Array.isArray(capabilities) ? capabilities : [];
    this.permissions = Array.isArray(permissions) ? permissions : [];
    this.version = version;
    this.enabled = true;
  }

  /** Primary task execution method */
  async execute(task, context) {
    throw new Error(`execute() method not implemented for agent "${this.id}".`);
  }

  /** Check if agent has a required capability */
  hasCapability(capability) {
    if (!capability || !Array.isArray(this.capabilities)) return false;
    return this.capabilities.includes(capability) || this.capabilities.includes("*");
  }
}

export default BaseAgent;
