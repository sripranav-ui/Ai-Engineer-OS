/**
 * @file intelligenceEngine.js
 * @description Master Intelligence Engine facade exposing graph queries, context ranking,
 * project indexing, and insight discovery APIs.
 */

import projectIndexer from "./projectIndexer.js";
import workspaceKnowledgeGraph from "./workspaceKnowledgeGraph.js";
import contextRanker from "./contextRanker.js";
import projectSummaryService from "./projectSummaryService.js";
import dependencyGraph from "./dependencyGraph.js";
import workspaceInsights from "./workspaceInsights.js";
import logger from "../../utils/logger.js";

export const intelligenceEngine = {
  /** Indexes entire workspace into Knowledge Graph */
  indexWorkspace: () => {
    logger.info("[IntelligenceEngine] Indexing workspace...");
    return projectIndexer.indexWorkspace();
  },

  /** Indexes specific project into Knowledge Graph */
  indexProject: (project) => {
    return projectIndexer.indexProject(project);
  },

  /** Builds and returns Knowledge Graph reference */
  buildKnowledgeGraph: () => {
    projectIndexer.indexWorkspace();
    return workspaceKnowledgeGraph;
  },

  /** Finds related entities for a node */
  findRelatedEntities: (nodeId) => {
    return workspaceKnowledgeGraph.findNeighbors(nodeId);
  },

  /** Gets context for a project */
  getProjectContext: (projectId) => {
    return projectSummaryService.generateSummary(projectId);
  },

  /** Gets active workspace graph summary */
  getWorkspaceContext: () => {
    return {
      totalNodes: workspaceKnowledgeGraph.nodes.size,
      totalEdges: workspaceKnowledgeGraph.edges.size,
    };
  },

  /** Ranks context nodes by query relevance */
  rankRelevantContext: (query, limit) => {
    return contextRanker.rankNodes(query, limit);
  },

  /** Generates project summary */
  generateProjectSummary: (projectId) => {
    return projectSummaryService.generateSummary(projectId);
  },

  /** Detects task dependencies and blockers */
  detectDependencies: () => {
    return dependencyGraph.detectBlockedTasks();
  },

  /** Finds orphan tasks */
  findOrphanTasks: () => {
    return workspaceInsights.findOrphanTasks();
  },

  /** Finds duplicate notes */
  findDuplicateNotes: () => {
    return workspaceInsights.findDuplicateNotes();
  },

  /** Suggests next actions */
  suggestNextActions: () => {
    return workspaceInsights.suggestNextActions();
  },
};

export default intelligenceEngine;
