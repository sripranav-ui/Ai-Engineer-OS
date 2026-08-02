/**
 * @file executionQueue.js
 * @description Priority queue managing workflow execution instances.
 * Supports priorities: 'URGENT', 'HIGH', 'NORMAL', 'LOW'.
 */

export const QUEUE_PRIORITIES = {
  URGENT: 1,
  HIGH:   2,
  NORMAL: 3,
  LOW:    4,
};

class ExecutionQueue {
  constructor() {
    this.queue = [];
  }

  /**
   * Enqueues a workflow execution task with priority sorting.
   * @param {Object} executionItem - ({ instanceId, workflowId, priority, inputs })
   */
  enqueue(executionItem) {
    const item = {
      ...executionItem,
      priority: executionItem.priority || "NORMAL",
      priorityWeight: QUEUE_PRIORITIES[executionItem.priority] || 3,
      enqueuedAt: new Date().toISOString(),
    };

    this.queue.push(item);
    this.queue.sort((a, b) => a.priorityWeight - b.priorityWeight);
    return item;
  }

  /**
   * Dequeues the next highest-priority workflow item.
   * @returns {Object|null}
   */
  dequeue() {
    return this.queue.shift() || null;
  }

  /**
   * Returns current pending queue length.
   * @returns {number}
   */
  get length() {
    return this.queue.length;
  }

  /**
   * Returns snapshot of queued items.
   * @returns {Object[]}
   */
  getPendingItems() {
    return [...this.queue];
  }
}

export const executionQueue = new ExecutionQueue();
export default executionQueue;
