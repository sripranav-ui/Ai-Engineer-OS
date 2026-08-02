// =======================================================
// agentOrchestrator.js — Master Agent Orchestrator
// =======================================================

import taskQueue from "../tasks/taskQueue.js";
import { TASK_STATUS } from "../tasks/taskTypes.js";
import plannerEngine from "../planner/plannerEngine.js";
import agentRegistry from "../registry/agentRegistry.js";
import metricsTracker from "../observability/metricsTracker.js";
import createAgentContext from "../base/agentContext.js";
import logger from "../../../../utils/logger.js";

export const agentOrchestrator = {
  /**
   * Dispatch user goal through planner and agent pipeline
   * @param {string} goal
   * @param {object} [contextData]
   */
  dispatchGoal: async (goal, contextData = {}) => {
    const startTime = Date.now();
    logger.info(`[AgentOrchestrator] Received goal: "${goal}". Planning execution...`);

    // 1. Enqueue task
    const task = taskQueue.enqueue({ title: goal, goal });
    taskQueue.updateStatus(task.id, TASK_STATUS.PLANNING);

    // 2. Generate plan
    const plan = plannerEngine.planGoal(goal);
    task.subtasks = plan.subtasks;

    taskQueue.updateStatus(task.id, TASK_STATUS.RUNNING);

    const context = createAgentContext(contextData);
    const results = [];

    try {
      // 3. Execute subtasks sequentially with assigned agents
      for (const sub of plan.subtasks) {
        const agent = agentRegistry.getAgentByRole(sub.recommendedRole) || agentRegistry.getAllAgents()[0];
        if (agent) {
          logger.info(`[AgentOrchestrator] Delegating subtask "${sub.title}" to agent "${agent.name}" (${agent.role})...`);
          const res = await agent.execute({ title: sub.title, goal }, context);
          results.push({ subtaskId: sub.id, agent: agent.name, output: res });
        }
      }

      const durationMs = Date.now() - startTime;
      taskQueue.updateStatus(task.id, TASK_STATUS.COMPLETED, { result: results });
      metricsTracker.recordTask("COMPLETED", durationMs);

      logger.info(`[AgentOrchestrator] Task "${task.id}" completed in ${durationMs}ms.`);
      return { taskId: task.id, status: TASK_STATUS.COMPLETED, plan, results };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      taskQueue.updateStatus(task.id, TASK_STATUS.FAILED, { error: err.message });
      metricsTracker.recordTask("FAILED", durationMs);

      logger.error(`[AgentOrchestrator] Task "${task.id}" failed:`, err);
      throw err;
    }
  },
};

export default agentOrchestrator;
