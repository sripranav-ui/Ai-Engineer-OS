/**
 * @file nodeRegistry.js
 * @description Dynamic node type factory and registry for Workflow Engine.
 * Registers concrete node constructors and enables third-party plugin node extensions.
 */

import StartNode from "../nodes/startNode.js";
import EndNode from "../nodes/endNode.js";
import AgentNode from "../nodes/agentNode.js";
import ToolNode from "../nodes/toolNode.js";
import ApprovalNode from "../nodes/approvalNode.js";
import logger from "../../../../utils/logger.js";

class NodeRegistry {
  constructor() {
    this.nodeTypes = new Map();

    // Auto-register core Phase 1 node types
    this.registerNodeType("start", StartNode);
    this.registerNodeType("end", EndNode);
    this.registerNodeType("agent", AgentNode);
    this.registerNodeType("tool", ToolNode);
    this.registerNodeType("approval", ApprovalNode);
  }

  /**
   * Registers a new node constructor class.
   * @param {string} type - Node type string identifier (e.g., 'start', 'agent')
   * @param {Function} NodeClass - Constructor class extending BaseWorkflowNode
   */
  registerNodeType(type, NodeClass) {
    if (!type || typeof NodeClass !== "function") {
      throw new Error("Node registration requires a valid 'type' string and constructor class.");
    }
    this.nodeTypes.set(type.toLowerCase(), NodeClass);
    logger.info(`[NodeRegistry] Registered node type "${type.toLowerCase()}".`);
  }

  /**
   * Instantiates a node by its registered type string.
   * @param {string} type - Node type string
   * @param {Object} nodeOptions - Options passed to node constructor ({ id, label, config })
   * @returns {BaseWorkflowNode} Instance of requested node
   */
  createNode(type, nodeOptions) {
    const key = (type || "").toLowerCase();
    const NodeClass = this.nodeTypes.get(key);
    if (!NodeClass) {
      throw new Error(`Node type "${type}" is not registered in NodeRegistry.`);
    }
    return new NodeClass(nodeOptions);
  }

  /**
   * Returns list of all registered node type identifiers.
   * @returns {string[]}
   */
  getRegisteredTypes() {
    return Array.from(this.nodeTypes.keys());
  }
}

export const nodeRegistry = new NodeRegistry();
export default nodeRegistry;
