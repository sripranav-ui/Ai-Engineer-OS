/**
 * @file workflowExecutor.js
 * @description Single-responsibility node step executor for traversing workflow graph nodes.
 * Emits 'node.started', 'node.completed', and 'node.failed' events via eventBus.
 */

import nodeRegistry from "../registry/nodeRegistry.js";
import eventBus from "../../../plugins/eventBus.js";
import workflowLogger from "../observability/workflowLogger.js";
import logger from "../../../../utils/logger.js";

export const workflowExecutor = {
  /**
   * Executes a workflow graph definition step-by-step.
   * @param {Object} instance - Workflow execution instance state container
   * @param {Object} workflowDef - Workflow definition ({ nodes, edges })
   * @param {Object} state - Active WorkflowState instance
   */
  executeGraph: async (instance, workflowDef, state) => {
    const nodes = workflowDef.nodes || [];
    const edges = workflowDef.edges || [];

    // Map node ID -> node definition
    const nodeMap = new Map();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    // Map source Node ID -> target Node IDs array
    const adjMap = new Map();
    edges.forEach((e) => {
      if (!adjMap.has(e.source)) adjMap.set(e.source, []);
      adjMap.get(e.source).push(e.target);
    });

    // Find Start Node
    const startDef = nodes.find((n) => n.type === "start") || nodes[0];
    if (!startDef) {
      throw new Error(`No valid start node found in workflow "${workflowDef.id}".`);
    }

    let currentNodeId = startDef.id;

    while (currentNodeId) {
      if (state.status === "PAUSED_APPROVAL" || state.status === "CANCELLED") {
        logger.info(`[WorkflowExecutor] Execution halted for instance "${instance.id}" (status: ${state.status}).`);
        break;
      }

      const nodeDef = nodeMap.get(currentNodeId);
      if (!nodeDef) break;

      // 1. Emit node.started event
      eventBus.publish("node.started", { instanceId: instance.id, nodeId: nodeDef.id, type: nodeDef.type });
      workflowLogger.logEvent(instance.id, "node.started", { nodeId: nodeDef.id, type: nodeDef.type });

      try {
        // Instantiate node via NodeRegistry
        const nodeInstance = nodeRegistry.createNode(nodeDef.type, {
          id: nodeDef.id,
          label: nodeDef.label,
          config: nodeDef.config || {},
        });

        // Execute node logic
        const output = await nodeInstance.execute(state.variables, state);
        state.recordNodeOutput(nodeDef.id, output);

        // 2. Emit node.completed event
        eventBus.publish("node.completed", { instanceId: instance.id, nodeId: nodeDef.id, output });
        workflowLogger.logEvent(instance.id, "node.completed", { nodeId: nodeDef.id, output });

        // If approval node paused execution, break loop
        if (nodeDef.type === "approval" || state.status === "PAUSED_APPROVAL") {
          break;
        }

        // Advance to next target node
        const targets = adjMap.get(currentNodeId) || [];
        currentNodeId = targets.length > 0 ? targets[0] : null;
      } catch (err) {
        eventBus.publish("node.failed", { instanceId: instance.id, nodeId: nodeDef.id, error: err.message });
        workflowLogger.logEvent(instance.id, "node.failed", { nodeId: nodeDef.id, error: err.message });
        state.status = "FAILED";
        throw err;
      }
    }

    return state;
  },
};

export default workflowExecutor;
