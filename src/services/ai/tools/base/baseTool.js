// =======================================================
// baseTool.js — Abstract Base Class for Enterprise Tools
// =======================================================
// Foundation contract for all AI tools. Requires id, name,
// category, permissions, timeout, validateArgs(), and execute().
// =======================================================

export class BaseTool {
  constructor({ id, name, description, category, version = "1.0.0", permissions = [], timeout = 10000 }) {
    if (!id || !name) {
      throw new Error("Tool construction requires 'id' and 'name'.");
    }
    this.id = id;
    this.name = name;
    this.description = description || "";
    this.category = category || "General";
    this.version = version;
    this.permissions = permissions;
    this.timeout = timeout;
    this.enabled = true;
  }

  /** Validate incoming arguments against required schema */
  validateArgs(args = {}) {
    return { valid: true, errors: [] };
  }

  /** Primary execution entry point */
  async execute(args, context) {
    throw new Error(`execute() not implemented for tool "${this.id}".`);
  }

  /** Optional cleanup / rollback on failure */
  async rollback(args, context, error) {
    return true;
  }
}

export default BaseTool;
