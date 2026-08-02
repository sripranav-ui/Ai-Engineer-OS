// =======================================================
// projectTools.js — Concrete Project Management Tools
// =======================================================

import BaseTool from "../base/baseTool.js";
import { PERMISSION_SCOPES } from "../runtime/permissionManager.js";
import projectEngine from "../../../projects/projectEngine.js";

export class CreateProjectTool extends BaseTool {
  constructor() {
    super({
      id: "create_project",
      name: "Create Project Tool",
      description: "Creates a new workspace software project.",
      category: "Projects",
      permissions: [PERMISSION_SCOPES.WRITE_PROJECTS],
    });
  }

  validateArgs(args) {
    if (!args.title) return { valid: false, errors: ["Missing required argument 'title'"] };
    return { valid: true, errors: [] };
  }

  async execute(args) {
    return projectEngine.createProject({
      title: args.title,
      description: args.description || "",
      category: args.category || "AI & Machine Learning",
      priority: args.priority || "Medium",
    });
  }
}

export default { CreateProjectTool };
