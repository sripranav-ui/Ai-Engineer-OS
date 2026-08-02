// =======================================================
// codingAgent.js — Coding Specialist Agent
// =======================================================

import BaseAgent from "../base/baseAgent.js";
import aiEngine from "../../aiEngine.js";

export class CodingAgent extends BaseAgent {
  constructor() {
    super({
      id: "agent_coder",
      name: "Senior Coding Copilot",
      role: "coder",
      capabilities: ["code:generate", "code:refactor", "code:review"],
      permissions: ["READ_NOTES", "WRITE_PROJECTS"],
    });
  }

  async execute(task, context) {
    return await aiEngine.sendMessage({
      userQuery: `[Coding Agent Task]: ${task.title}\nGoal: ${task.goal}`,
      roleId: "coder",
    });
  }
}

export default CodingAgent;
