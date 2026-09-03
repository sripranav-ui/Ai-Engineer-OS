/**
 * @file taskQueue.js
 * @description Task Queue for AI Agent Execution Pipeline.
 * FIFO queue with priority support, retry logic, and ordered execution.
 */

class TaskQueue {
  constructor() {
    this.queue = [];
    this.completed = [];
    this.failed = [];
  }

  /**
   * Enqueue a task
   * @param {{ id: string, label: string, type: string, payload: Object, priority?: number }} task
   */
  enqueue(task) {
    this.queue.push({
      ...task,
      priority: task.priority || 0,
      status: "queued",
      enqueuedAt: Date.now(),
      retries: 0,
    });
    // Sort by priority (higher first)
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Dequeue the next task
   * @returns {Object|null}
   */
  dequeue() {
    if (this.queue.length === 0) return null;
    const task = this.queue.shift();
    task.status = "running";
    task.startedAt = Date.now();
    return task;
  }

  /**
   * Mark a task as completed
   * @param {string} taskId
   * @param {Object} [result]
   */
  markCompleted(taskId, result = {}) {
    const idx = this.queue.findIndex((t) => t.id === taskId);
    let task;
    if (idx >= 0) {
      task = this.queue.splice(idx, 1)[0];
    } else {
      task = { id: taskId };
    }
    task.status = "completed";
    task.completedAt = Date.now();
    task.result = result;
    this.completed.push(task);
  }

  /**
   * Mark a task as failed
   * @param {string} taskId
   * @param {string} error
   */
  markFailed(taskId, error = "") {
    const idx = this.queue.findIndex((t) => t.id === taskId);
    let task;
    if (idx >= 0) {
      task = this.queue.splice(idx, 1)[0];
    } else {
      task = { id: taskId };
    }
    task.status = "failed";
    task.failedAt = Date.now();
    task.error = error;
    this.failed.push(task);
  }

  /**
   * Get current queue status
   * @returns {{ pending: number, completed: number, failed: number, total: number }}
   */
  getStatus() {
    return {
      pending: this.queue.length,
      completed: this.completed.length,
      failed: this.failed.length,
      total: this.queue.length + this.completed.length + this.failed.length,
    };
  }

  /**
   * Get all tasks in all states
   * @returns {{ queued: Array, completed: Array, failed: Array }}
   */
  getAllTasks() {
    return {
      queued: [...this.queue],
      completed: [...this.completed],
      failed: [...this.failed],
    };
  }

  /**
   * Check if queue has pending tasks
   * @returns {boolean}
   */
  hasPending() {
    return this.queue.length > 0;
  }

  /** Clear all queues */
  clear() {
    this.queue = [];
    this.completed = [];
    this.failed = [];
  }
}

export const taskQueue = new TaskQueue();
export default taskQueue;
