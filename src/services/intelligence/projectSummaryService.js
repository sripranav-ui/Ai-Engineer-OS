/**
 * @file projectSummaryService.js
 * @description Summarizer constructing graph-driven project status summaries.
 */

import workspaceKnowledgeGraph from "./workspaceKnowledgeGraph.js";

export const projectSummaryService = {
  /**
   * Generates graph-driven summary for a project.
   * @param {string} projectId
   * @returns {Object}
   */
  generateSummary: (projectId) => {
    const projectNode = workspaceKnowledgeGraph.getNode(projectId);
    const neighbors = workspaceKnowledgeGraph.findNeighbors(projectId);
    const tasks = neighbors.filter((n) => n.targetNode && n.targetNode.type === "Task");

    return {
      projectId,
      title: projectNode ? projectNode.title : projectId,
      totalConnectedEntities: neighbors.length,
      taskCount: tasks.length,
      generatedAt: new Date().toISOString(),
    };
  },
};

export default projectSummaryService;
