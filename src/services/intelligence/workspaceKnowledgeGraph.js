/**
 * @file workspaceKnowledgeGraph.js
 * @description In-memory Graph Database storing Workspace Knowledge Graph nodes and edges.
 */

import logger from "../../utils/logger.js";

class WorkspaceKnowledgeGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyMap = new Map();
  }

  /**
   * Adds a node to the Knowledge Graph.
   * @param {Object} node
   */
  addNode(node) {
    if (!node || !node.id) return;
    this.nodes.set(node.id, node);
    if (!this.adjacencyMap.has(node.id)) {
      this.adjacencyMap.set(node.id, []);
    }
  }

  /**
   * Adds an edge to the Knowledge Graph.
   * @param {Object} edge
   */
  addEdge(edge) {
    if (!edge || !edge.source || !edge.target) return;
    this.edges.set(edge.id, edge);

    if (!this.adjacencyMap.has(edge.source)) this.adjacencyMap.set(edge.source, []);
    this.adjacencyMap.get(edge.source).push(edge);
  }

  /** Gets node by ID */
  getNode(id) {
    return this.nodes.get(id) || null;
  }

  /** Gets total count of nodes */
  getNodeCount() {
    return this.nodes.size;
  }

  /** Gets list of all nodes */
  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  /** Gets list of all edges */
  getAllEdges() {
    return Array.from(this.edges.values());
  }

  /** Gets all nodes of a specific type */
  getNodesByType(type) {
    return Array.from(this.nodes.values()).filter((n) => n.type === type);
  }

  /** Finds outgoing neighbors for a node */
  findNeighbors(nodeId) {
    const outgoingEdges = this.adjacencyMap.get(nodeId) || [];
    return outgoingEdges.map((e) => ({
      edge: e,
      targetNode: this.nodes.get(e.target) || null,
    }));
  }

  /** Clears all nodes and edges */
  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.adjacencyMap.clear();
  }
}

export const workspaceKnowledgeGraph = new WorkspaceKnowledgeGraph();
export default workspaceKnowledgeGraph;
