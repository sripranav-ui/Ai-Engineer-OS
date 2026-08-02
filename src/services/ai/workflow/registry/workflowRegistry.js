/**
 * @file workflowRegistry.js
 * @description Master Workflow Registry managing saved workflows, versioning,
 * JSON import/export, and graph validation (DFS cycle detection & duplicate ID checks).
 */

import storageService from "../../../storageService.js";
import logger from "../../../../utils/logger.js";

const WORKFLOWS_STORAGE_KEY = "workflow_definitions_registry";

class WorkflowRegistry {
  constructor() {
    this.workflowsMap = new Map();
    this.loadFromStorage();
  }

  /**
   * Loads saved workflows from persistent storage.
   */
  loadFromStorage() {
    try {
      const raw = storageService.get(WORKFLOWS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        list.forEach((wf) => this.workflowsMap.set(wf.id, wf));
      }
    } catch (err) {
      logger.error("[WorkflowRegistry] Error loading workflow definitions:", err);
    }
  }

  /**
   * Saves registered workflows to persistent storage.
   */
  saveToStorage() {
    try {
      const list = Array.from(this.workflowsMap.values());
      storageService.set(WORKFLOWS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      logger.error("[WorkflowRegistry] Error saving workflow definitions:", err);
    }
  }

  /**
   * Validates a workflow graph for duplicate node IDs and cycles using Depth-First Search (DFS).
   * @param {Object} workflowDef - Workflow definition ({ id, name, nodes, edges })
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateWorkflow(workflowDef) {
    const errors = [];
    if (!workflowDef || !workflowDef.id || !workflowDef.name) {
      return { valid: false, errors: ["Workflow definition requires 'id' and 'name'."] };
    }

    const nodes = workflowDef.nodes || [];
    const edges = workflowDef.edges || [];

    // 1. Check duplicate node IDs
    const nodeIds = new Set();
    nodes.forEach((n) => {
      if (nodeIds.has(n.id)) {
        errors.push(`Duplicate node ID "${n.id}" detected in workflow.`);
      }
      nodeIds.add(n.id);
    });

    // 2. DFS Cycle Detection on Graph Edges
    const adj = new Map();
    nodeIds.forEach((id) => adj.set(id, []));
    edges.forEach((edge) => {
      if (adj.has(edge.source) && adj.has(edge.target)) {
        adj.get(edge.source).push(edge.target);
      }
    });

    const visited = new Set();
    const recursionStack = new Set();

    const hasCycleDFS = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of nodeIds) {
      if (!visited.has(nodeId)) {
        if (hasCycleDFS(nodeId)) {
          errors.push("Cyclic graph dependency detected in workflow edges.");
          break;
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Registers a workflow definition.
   * @param {Object} workflowDef
   */
  registerWorkflow(workflowDef) {
    const validation = this.validateWorkflow(workflowDef);
    if (!validation.valid) {
      throw new Error(`Workflow Validation Failed: ${validation.errors.join("; ")}`);
    }

    if (this.workflowsMap.has(workflowDef.id)) {
      logger.info(`[WorkflowRegistry] Overwriting existing workflow ID "${workflowDef.id}".`);
    }

    const entry = {
      ...workflowDef,
      version: workflowDef.version || "1.0.0",
      updatedAt: new Date().toISOString(),
    };

    this.workflowsMap.set(entry.id, entry);
    this.saveToStorage();
    logger.info(`[WorkflowRegistry] Registered workflow "${entry.name}" (${entry.id}).`);
    return entry;
  }

  /** Gets workflow definition by ID */
  getWorkflow(id) {
    return this.workflowsMap.get(id) || null;
  }

  /** Lists all registered workflow definitions */
  getAllWorkflows() {
    return Array.from(this.workflowsMap.values());
  }

  /** Exports workflow definition to JSON string */
  exportToJSON(id) {
    const wf = this.getWorkflow(id);
    if (!wf) throw new Error(`Workflow "${id}" not found.`);
    return JSON.stringify(wf, null, 2);
  }

  /** Imports workflow definition from JSON string */
  importFromJSON(jsonString) {
    const parsed = JSON.parse(jsonString);
    return this.registerWorkflow(parsed);
  }
}

export const workflowRegistry = new WorkflowRegistry();
export default workflowRegistry;
