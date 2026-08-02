// =======================================================
// aiProjectHelper.js — AI Project Management Helper
// =======================================================
// Connects Project Engine with Phase 5 AI Engine to automate:
//   - Task decomposition from feature goal
//   - Effort estimation & risk indicators
//   - Auto-generating architecture docs
//   - Summarizing project status & progress
// =======================================================

import aiEngine from "../ai/aiEngine";

export const aiProjectHelper = {
  /** Decompose feature goal into technical tasks */
  decomposeFeature: async (featureDescription, onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Decompose the following feature goal into 4 actionable technical tasks for a Kanban board. For each task specify title, priority (Low/Medium/High/Urgent), and estimated hours:\n\nGoal: ${featureDescription}`,
      roleId: "pm",
      onChunk,
    });
  },

  /** Generate project architecture documentation */
  generateDoc: async (projectTitle, projectDescription, docCategory = "Architecture", onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Write a high-quality Markdown document for category "${docCategory}" for the project "${projectTitle}". Description: ${projectDescription}`,
      roleId: "coder",
      onChunk,
    });
  },

  /** Perform AI project health check & risk assessment */
  analyzeProjectHealth: async (project, tasks = [], onChunk) => {
    const taskSummary = tasks.map((t) => `- ${t.title} (${t.status}, Priority: ${t.priority})`).join("\n");
    return await aiEngine.sendMessage({
      userQuery: `Perform a project health check for "${project.title}".\nStatus: ${project.status}\nDeadline: ${project.deadline || "Not set"}\n\nTasks:\n${taskSummary}\n\nProvide: 1) Overall Health (Good/Warning/Critical), 2) Top 2 Risks, 3) Actionable recommendations.`,
      roleId: "pm",
      onChunk,
    });
  },
};

export default aiProjectHelper;
