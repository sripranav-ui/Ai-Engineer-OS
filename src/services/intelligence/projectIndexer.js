/**
 * @file projectIndexer.js
 * @description Indexes workspace entities (projects, notes, workflows, tools, agents)
 * into workspaceKnowledgeGraph.
 */

import workspaceKnowledgeGraph from "./workspaceKnowledgeGraph.js";
import entityExtractor, { ENTITY_TYPES } from "./entityExtractor.js";
import relationshipBuilder, { RELATIONSHIP_TYPES } from "./relationshipBuilder.js";
import workflowRegistry from "../ai/workflow/registry/workflowRegistry.js";
import toolRegistry from "../ai/tools/registry/toolRegistry.js";
import agentRegistry from "../ai/agents/registry/agentRegistry.js";
import logger from "../../utils/logger.js";

export const projectIndexer = {
  /**
   * Indexes entire workspace environment into Knowledge Graph.
   */
  indexWorkspace: () => {
    logger.info("[ProjectIndexer] Indexing workspace into Knowledge Graph...");
    workspaceKnowledgeGraph.clear();

    // 1. Index Registered Workflows
    const workflows = workflowRegistry.getAllWorkflows();
    workflows.forEach((wf) => {
      const node = entityExtractor.createNode(wf.id, ENTITY_TYPES.WORKFLOW, wf.name, wf);
      workspaceKnowledgeGraph.addNode(node);
    });

    // 2. Index Registered Tools
    const tools = toolRegistry.getAllTools();
    tools.forEach((t) => {
      const node = entityExtractor.createNode(t.id, ENTITY_TYPES.TOOL, t.name, { category: t.category });
      workspaceKnowledgeGraph.addNode(node);
    });

    // 3. Index Registered AI Agents
    const agents = agentRegistry.getAllAgents();
    agents.forEach((a) => {
      const node = entityExtractor.createNode(a.id, ENTITY_TYPES.AGENT, a.name, { role: a.role });
      workspaceKnowledgeGraph.addNode(node);
    });

    logger.info(`[ProjectIndexer] Indexing completed. Total graph nodes: ${workspaceKnowledgeGraph.nodes.size}`);
    return true;
  },

  /**
   * Indexes specific project into Knowledge Graph.
   * @param {Object} project
   */
  indexProject: (project) => {
    if (!project || !project.id) return;
    const node = entityExtractor.createNode(project.id, ENTITY_TYPES.PROJECT, project.title || project.name, project);
    workspaceKnowledgeGraph.addNode(node);

    if (project.tasks && Array.isArray(project.tasks)) {
      project.tasks.forEach((t) => {
        const taskNode = entityExtractor.createNode(t.id, ENTITY_TYPES.TASK, t.title || t.name, t);
        workspaceKnowledgeGraph.addNode(taskNode);
        const edge = relationshipBuilder.createEdge(taskNode.id, project.id, RELATIONSHIP_TYPES.BELONGS_TO);
        workspaceKnowledgeGraph.addEdge(edge);
      });
    }
  },
};

export default projectIndexer;
