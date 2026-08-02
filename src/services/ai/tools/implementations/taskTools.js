// =======================================================
// taskTools.js — Concrete Task Management Tools
// =======================================================

import BaseTool from "../base/baseTool.js";
import { PERMISSION_SCOPES } from "../runtime/permissionManager.js";
import taskEngine from "../../../projects/taskEngine.js";

export class CreateTaskTool extends BaseTool {
  constructor() {
    super({
      id: "create_task",
      name: "Create Task Tool",
      description: "Creates a new task in a project Kanban column.",
      category: "Tasks",
      permissions: [PERMISSION_SCOPES.WRITE_PROJECTS],
    });
  }

  validateArgs(args) {
    if (!args.title || !args.projectId) {
      return { valid: false, errors: ["Missing required arguments 'title' or 'projectId'"] };
    }
    return { valid: true, errors: [] };
  }

  async execute(args) {
    return taskEngine.createTask(args.projectId, {
      title: args.title,
      priority: args.priority || "Medium",
      status: args.status || "todo",
    });
  }
}

export default { CreateTaskTool };
