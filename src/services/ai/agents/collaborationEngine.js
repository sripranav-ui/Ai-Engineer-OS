/**
 * @file collaborationEngine.js
 * @description Master Autonomous Multi-Agent Collaboration Engine facade API.
 */

import goalManager from "./goalManager.js";
import taskPlanner from "./taskPlanner.js";
import executionPlanner from "./executionPlanner.js";
import delegationEngine from "./delegationEngine.js";
import agentCommunicationBus from "./agentCommunicationBus.js";
import consensusEngine from "./consensusEngine.js";
import agentSupervisor from "./agentSupervisor.js";
import executionMonitor from "./executionMonitor.js";
import executionHistory from "./executionHistory.js";
import logger from "../../../utils/logger.js";

export const collaborationEngine = {
  /**
   * Executes a user goal autonomously through multi-agent collaboration.
   * @param {string} goalText
   * @param {Object} [options={}]
   * @returns {Promise<Object>} Execution result package
   */
  executeGoal: async (goalText, options = {}) => {
    logger.info(`[CollaborationEngine] Starting autonomous multi-agent goal execution: "${goalText}"`);
    executionMonitor.trackStart();

    // 1. Ingest goal
    const goal = goalManager.createGoal(goalText, options);

    // 2. Plan subtasks & execution graph
    const tasks = taskPlanner.planTasks(goal);
    const plan = executionPlanner.createExecutionPlan(tasks);

    const stepResults = [];

    try {
      // 3. Delegate and execute step by step
      for (const item of plan) {
        const agent = delegationEngine.delegateTask(item.task);

        // Emit assignment message
        agentCommunicationBus.sendMessage("CollaborationEngine", agent.id, "task_assignment", { task: item.task });

        // Execute task with agent
        const res = await agent.execute(item.task, {});
        stepResults.push({ subtaskId: item.task.id, agent: agent.name, output: res });
      }

      goalManager.updateStatus(goal.id, "COMPLETED");
      executionMonitor.trackEnd(true);

      const resultPackage = {
        goalId: goal.id,
        goalText,
        status: "COMPLETED",
        subtasksCount: tasks.length,
        stepResults,
        completedAt: new Date().toISOString(),
      };

      executionHistory.recordExecution(resultPackage);
      return resultPackage;
    } catch (err) {
      goalManager.updateStatus(goal.id, "FAILED");
      executionMonitor.trackEnd(false);
      logger.error(`[CollaborationEngine] Multi-agent execution failed for goal "${goal.id}":`, err);
      throw err;
    }
  },
};

export default collaborationEngine;
