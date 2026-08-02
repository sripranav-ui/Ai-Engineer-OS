/**
 * @file workflowWorkerPool.js
 * @description Worker pool scheduler executing queued workflow instances in isolated async contexts.
 */

import executionQueue from "./executionQueue.js";
import workflowExecutor from "./workflowExecutor.js";
import checkpointManager from "./checkpointManager.js";
import logger from "../../../../utils/logger.js";

class WorkflowWorkerPool {
  constructor(maxConcurrency = 4) {
    this.maxConcurrency = maxConcurrency;
    this.activeWorkers = 0;
  }

  /**
   * Processes next pending task in the execution queue.
   */
  async processNext(runTaskCallback) {
    if (this.activeWorkers >= this.maxConcurrency || executionQueue.length === 0) {
      return;
    }

    const item = executionQueue.dequeue();
    if (!item) return;

    this.activeWorkers++;
    logger.info(`[WorkflowWorkerPool] Worker processing instance "${item.instanceId}" (Priority: ${item.priority}).`);

    try {
      if (runTaskCallback) {
        await runTaskCallback(item);
      }
    } catch (err) {
      logger.error(`[WorkflowWorkerPool] Error executing instance "${item.instanceId}":`, err);
    } finally {
      this.activeWorkers--;
      // Trigger processNext asynchronously for subsequent queue items
      setTimeout(() => this.processNext(runTaskCallback), 0);
    }
  }
}

export const workflowWorkerPool = new WorkflowWorkerPool();
export default workflowWorkerPool;
