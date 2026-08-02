// =======================================================
// careerMentorAgent.js — Career Mentor Specialist Agent
// =======================================================

import BaseAgent from "../base/baseAgent.js";
import aiEngine from "../../aiEngine.js";

export class CareerMentorAgent extends BaseAgent {
  constructor() {
    super({
      id: "agent_career",
      name: "Career & Interview Coach",
      role: "career",
      capabilities: ["interview:evaluate", "resume:optimize"],
      permissions: ["READ_NOTES"],
    });
  }

  async execute(task, context) {
    return await aiEngine.sendMessage({
      userQuery: `[Career Agent Task]: ${task.title}\nGoal: ${task.goal}`,
      roleId: "career",
    });
  }
}

export default CareerMentorAgent;
