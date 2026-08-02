// =======================================================
// taskQueue.js — Task Queue State Machine
// =======================================================

import { createTaskShape, TASK_STATUS } from "./taskTypes.js";

const QUEUE = [];

export const taskQueue = {
  /** Enqueue new task */
  enqueue: (taskData) => {
    const task = createTaskShape(taskData);
    QUEUE.push(task);
    return task;
  },

  /** Update task status */
  updateStatus: (taskId, status, extra = {}) => {
    const task = QUEUE.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      Object.assign(task, extra);
    }
    return task;
  },

  /** Get all queued / active tasks */
  getQueue: () => [...QUEUE],

  /** Alias for getQueue */
  getAllTasks: () => [...QUEUE],
};

export default taskQueue;
