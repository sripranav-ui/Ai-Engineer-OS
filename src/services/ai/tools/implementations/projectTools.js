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

  async execute(args, context = {}) {
    const userId = context.userId || context.user?.id;
    if (!userId) {
      throw new Error("[CreateProjectTool] Refusing project creation: missing active user identity in execution context.");
    }
    const workspaceId = context.workspaceId || "default";
    return projectEngine.createProject(
      {
        title: args.title,
        description: args.description || "",
        category: args.category || "AI & Machine Learning",
        priority: args.priority || "Medium",
      },
      workspaceId,
      userId
    );
  }
}

export default { CreateProjectTool };
