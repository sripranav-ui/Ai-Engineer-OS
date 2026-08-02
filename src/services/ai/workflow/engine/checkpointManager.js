/**
 * @file checkpointManager.js
 * @description Manages persistence and restoration of workflow state checkpoints.
 */

import storageService from "../../../storageService.js";
import logger from "../../../../utils/logger.js";

const CHECKPOINT_PREFIX = "workflow_checkpoint_";

export const checkpointManager = {
  /**
   * Persists state checkpoint for a workflow execution instance.
   * @param {string} instanceId - Workflow instance ID
   * @param {Object} stateSnapshot - WorkflowState snapshot object
   */
  saveCheckpoint: (instanceId, stateSnapshot) => {
    try {
      const key = `${CHECKPOINT_PREFIX}${instanceId}`;
      storageService.set(key, JSON.stringify(stateSnapshot));
      logger.info(`[CheckpointManager] Saved checkpoint for instance "${instanceId}".`);
    } catch (err) {
      logger.error(`[CheckpointManager] Error saving checkpoint for "${instanceId}":`, err);
    }
  },

  /**
   * Restores persisted state checkpoint for a workflow execution instance.
   * @param {string} instanceId - Workflow instance ID
   * @returns {Object|null}
   */
  restoreCheckpoint: (instanceId) => {
    try {
      const key = `${CHECKPOINT_PREFIX}${instanceId}`;
      const raw = storageService.get(key);
      if (!raw) return null;
      logger.info(`[CheckpointManager] Restored checkpoint for instance "${instanceId}".`);
      return JSON.parse(raw);
    } catch (err) {
      logger.error(`[CheckpointManager] Error restoring checkpoint for "${instanceId}":`, err);
      return null;
    }
  },

  /**
   * Removes persisted checkpoint for an instance.
   * @param {string} instanceId
   */
  clearCheckpoint: (instanceId) => {
    try {
      const key = `${CHECKPOINT_PREFIX}${instanceId}`;
      storageService.remove(key);
    } catch (err) {
      logger.error(`[CheckpointManager] Error clearing checkpoint for "${instanceId}":`, err);
    }
  },
};

export default checkpointManager;
