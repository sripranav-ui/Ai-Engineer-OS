// =======================================================
// projectManagerAgent.js — Project Manager Specialist Agent
// =======================================================

import BaseAgent from "../base/baseAgent.js";
import aiEngine from "../../aiEngine.js";

export class ProjectManagerAgent extends BaseAgent {
  constructor() {
    super({
      id: "agent_pm",
      name: "Project Manager Copilot",
      role: "pm",
      capabilities: ["task:decompose", "sprint:plan"],
      permissions: ["WRITE_PROJECTS", "READ_PROJECTS"],
    });
  }

  async execute(task, context) {
    return await aiEngine.sendMessage({
      userQuery: `[PM Agent Task]: ${task.title}\nGoal: ${task.goal}`,
      roleId: "pm",
    });
  }
}

export default ProjectManagerAgent;
