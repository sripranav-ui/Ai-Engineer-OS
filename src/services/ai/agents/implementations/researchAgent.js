// =======================================================
// researchAgent.js — Research Specialist Agent
// =======================================================

import BaseAgent from "../base/baseAgent.js";
import aiEngine from "../../aiEngine.js";

export class ResearchAgent extends BaseAgent {
  constructor() {
    super({
      id: "agent_researcher",
      name: "Research & RAG Specialist",
      role: "researcher",
      capabilities: ["rag:search", "doc:analyze"],
      permissions: ["READ_KNOWLEDGE", "READ_NOTES"],
    });
  }

  async execute(task, context) {
    return await aiEngine.sendMessage({
      userQuery: `[Research Agent Task]: ${task.title}\nGoal: ${task.goal}`,
      roleId: "mentor",
    });
  }
}

export default ResearchAgent;
