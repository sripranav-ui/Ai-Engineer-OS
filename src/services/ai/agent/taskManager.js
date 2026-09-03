/**
 * @file taskManager.js
 * @description Task Manager for AI Agent Execution Pipeline.
 * Decomposes complex user requests into ordered execution tasks.
 * Each request becomes a structured task tree with dependencies.
 */

import taskQueue from "./taskQueue.js";
import eventBus from "../../plugins/eventBus.js";

const TASK_TYPES = {
  SCAN_PROJECT: "scan_project",
  INDEX_PROJECT: "index_project",
  CREATE_FILE: "create_file",
  EDIT_FILE: "edit_file",
  DELETE_FILE: "delete_file",
  INSERT_CODE: "insert_code",
  SEARCH_KNOWLEDGE: "search_knowledge",
  RUN_COMMAND: "run_command",
  VALIDATE: "validate",
  CHECKPOINT: "checkpoint",
  REVIEW: "review",
};

class TaskManager {
  constructor() {
    this.activePlan = null;
    this.taskHistory = [];
  }

  /**
   * Decompose a user request + orchestrator plan into an ordered task list
   * @param {string} requestDescription - User's natural language request
   * @param {Object} plan - Orchestrator execution plan ({ intent, useStudio, useKnowledge, useTools, executionOrder })
   * @param {Object} [projectContext] - Project index/scan data
   * @returns {{ planId: string, tasks: Array<{ id: string, label: string, type: string, payload: Object }> }}
   */
  createTaskPlan(requestDescription = "", plan = {}, projectContext = {}) {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tasks = [];
    let taskIndex = 0;

    const makeTaskId = () => `task_${planId}_${++taskIndex}`;

    // 1. Always scan project first
    tasks.push({
      id: makeTaskId(),
      label: "Scan workspace project",
      type: TASK_TYPES.SCAN_PROJECT,
      payload: {},
      priority: 100,
    });

    // 2. Index project graph
    tasks.push({
      id: makeTaskId(),
      label: "Index project dependencies",
      type: TASK_TYPES.INDEX_PROJECT,
      payload: {},
      priority: 90,
    });

    // 3. Knowledge retrieval (if plan requires it)
    if (plan.useKnowledge) {
      tasks.push({
        id: makeTaskId(),
        label: "Search knowledge base",
        type: TASK_TYPES.SEARCH_KNOWLEDGE,
        payload: { query: requestDescription },
        priority: 80,
      });
    }

    // 4. Generate execution tasks based on intent
    switch (plan.intent) {
      case "coding":
      case "file_generation":
        tasks.push({
          id: makeTaskId(),
          label: "Generate code implementation",
          type: TASK_TYPES.CREATE_FILE,
          payload: { request: requestDescription },
          priority: 60,
        });
        tasks.push({
          id: makeTaskId(),
          label: "Insert code into Studio",
          type: TASK_TYPES.INSERT_CODE,
          payload: { request: requestDescription },
          priority: 50,
        });
        break;

      case "refactoring":
      case "bug_fix":
        tasks.push({
          id: makeTaskId(),
          label: "Analyze and apply edits",
          type: TASK_TYPES.EDIT_FILE,
          payload: { request: requestDescription },
          priority: 60,
        });
        break;

      case "planning":
        tasks.push({
          id: makeTaskId(),
          label: "Generate engineering plan",
          type: TASK_TYPES.REVIEW,
          payload: { request: requestDescription },
          priority: 60,
        });
        break;

      default:
        tasks.push({
          id: makeTaskId(),
          label: "Process request",
          type: TASK_TYPES.REVIEW,
          payload: { request: requestDescription },
          priority: 60,
        });
        break;
    }

    // 5. Validation step
    tasks.push({
      id: makeTaskId(),
      label: "Run validation checks",
      type: TASK_TYPES.VALIDATE,
      payload: {},
      priority: 20,
    });

    // 6. Create checkpoint
    tasks.push({
      id: makeTaskId(),
      label: "Commit execution checkpoint",
      type: TASK_TYPES.CHECKPOINT,
      payload: { description: requestDescription },
      priority: 10,
    });

    this.activePlan = { planId, tasks, request: requestDescription, plan, createdAt: Date.now() };

    // Enqueue all tasks
    for (const task of tasks) {
      taskQueue.enqueue(task);
    }

    eventBus.emit("AGENT_PLAN_CREATED", this.activePlan);
    this.taskHistory.push(this.activePlan);

    return this.activePlan;
  }

  /**
   * Get the current active plan
   * @returns {Object|null}
   */
  getActivePlan() {
    return this.activePlan;
  }

  /**
   * Get task execution history
   * @param {number} [limit=10]
   * @returns {Array}
   */
  getHistory(limit = 10) {
    return this.taskHistory.slice(-limit);
  }

  /** Clear active plan */
  clearActivePlan() {
    this.activePlan = null;
    taskQueue.clear();
  }
}

export const AGENT_TASK_TYPES = TASK_TYPES;
export const taskManager = new TaskManager();
export default taskManager;
