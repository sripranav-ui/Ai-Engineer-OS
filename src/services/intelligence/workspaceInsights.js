/**
 * @file workspaceInsights.js
 * @description Insight analyzer discovering orphan tasks, duplicate notes, and next actions.
 */

import workspaceKnowledgeGraph from "./workspaceKnowledgeGraph.js";

export const workspaceInsights = {
  /**
   * Finds tasks not linked to any active project.
   * @returns {Object[]}
   */
  findOrphanTasks: () => {
    const tasks = workspaceKnowledgeGraph.getNodesByType("Task");
    return tasks.filter((t) => {
      const neighbors = workspaceKnowledgeGraph.findNeighbors(t.id);
      return !neighbors.some((n) => n.edge.type === "belongs_to");
    });
  },

  /**
   * Finds duplicate notes by matching titles.
   * @returns {Object[]}
   */
  findDuplicateNotes: () => {
    const notes = workspaceKnowledgeGraph.getNodesByType("Document");
    const seen = new Map();
    const duplicates = [];

    notes.forEach((n) => {
      if (seen.has(n.title)) {
        duplicates.push(n);
      } else {
        seen.set(n.title, n);
      }
    });

    return duplicates;
  },

  /**
   * Suggests next actions based on Knowledge Graph state.
   * @returns {string[]}
   */
  suggestNextActions: () => {
    const orphans = workspaceInsights.findOrphanTasks();
    const suggestions = [];
    if (orphans.length > 0) {
      suggestions.push(`Assign ${orphans.length} orphan tasks to an active project.`);
    }
    suggestions.push("Run 'Automated Code Review' workflow on active repository.");
    return suggestions;
  },
};

export default workspaceInsights;
