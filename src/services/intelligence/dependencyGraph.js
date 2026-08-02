/**
 * @file dependencyGraph.js
 * @description Analyzes dependency edges in the Knowledge Graph for blocked tasks and cycles.
 */

import workspaceKnowledgeGraph from "./workspaceKnowledgeGraph.js";

export const dependencyGraph = {
  /**
   * Detects blocked tasks in the Knowledge Graph.
   * @returns {Object[]} List of blocked task nodes
   */
  detectBlockedTasks: () => {
    const tasks = workspaceKnowledgeGraph.getNodesByType("Task");
    return tasks.filter((t) => {
      const neighbors = workspaceKnowledgeGraph.findNeighbors(t.id);
      return neighbors.some((n) => n.edge.type === "depends_on" || n.edge.type === "blocked_by");
    });
  },
};

export default dependencyGraph;
