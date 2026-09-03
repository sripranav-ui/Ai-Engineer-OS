/**
 * @file checkpointManager.js
 * @description Checkpoint Manager for AI Agent Execution Pipeline.
 * Creates restore points before file modifications, enabling undo/redo/rollback.
 * Stores checkpoints in localStorage with timestamp-ordered snapshots.
 */

import eventBus from "../../plugins/eventBus.js";

const CHECKPOINT_STORAGE_KEY = "ai_agent_checkpoints_v1";
const MAX_CHECKPOINTS = 50;

class CheckpointManager {
  constructor() {
    this.checkpoints = this._load();
  }

  /**
   * Create a checkpoint before a destructive operation
   * @param {string} taskId - Associated task ID
   * @param {string} description - Human-readable checkpoint label
   * @param {Array<{ path: string, contentBefore: string }>} fileSnapshots - File states before modification
   * @returns {{ checkpointId: string, timestamp: number }}
   */
  createCheckpoint(taskId, description, fileSnapshots = []) {
    const checkpointId = `ckpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const checkpoint = {
      id: checkpointId,
      taskId,
      description,
      timestamp: Date.now(),
      files: fileSnapshots.map((f) => ({
        path: f.path,
        contentBefore: f.contentBefore,
        contentAfter: f.contentAfter || null,
      })),
    };

    this.checkpoints.unshift(checkpoint);
    if (this.checkpoints.length > MAX_CHECKPOINTS) {
      this.checkpoints = this.checkpoints.slice(0, MAX_CHECKPOINTS);
    }

    this._save();
    return { checkpointId, timestamp: checkpoint.timestamp };
  }

  /**
   * Rollback to a specific checkpoint by restoring file states
   * @param {string} checkpointId
   * @returns {{ success: boolean, restoredFiles: Array<string>, error?: string }}
   */
  rollback(checkpointId) {
    const checkpoint = this.checkpoints.find((c) => c.id === checkpointId);
    if (!checkpoint) {
      return { success: false, restoredFiles: [], error: `Checkpoint '${checkpointId}' not found.` };
    }

    const restoredFiles = [];
    for (const fileSnapshot of checkpoint.files) {
      restoredFiles.push(fileSnapshot.path);
      try {
        eventBus.emit("RESTORE_FILE_CHECKPOINT", {
          path: fileSnapshot.path,
          content: fileSnapshot.contentBefore,
          timestamp: Date.now(),
        });
      } catch (e) {
        // EventBus notification fallback
      }
    }

    return {
      success: true,
      restoredFiles,
      checkpoint,
    };
  }

  /**
   * Undo the most recent checkpoint (restore previous state)
   * @returns {{ success: boolean, checkpointId?: string, restoredFiles?: Array<string> }}
   */
  undo() {
    if (this.checkpoints.length === 0) {
      return { success: false, error: "No checkpoints available to undo." };
    }
    return this.rollback(this.checkpoints[0].id);
  }

  /**
   * List all available checkpoints
   * @param {number} [limit=20]
   * @returns {Array<{ id: string, taskId: string, description: string, timestamp: number, fileCount: number }>}
   */
  listCheckpoints(limit = 20) {
    return this.checkpoints.slice(0, limit).map((c) => ({
      id: c.id,
      taskId: c.taskId,
      description: c.description,
      timestamp: c.timestamp,
      fileCount: c.files.length,
    }));
  }

  /**
   * Get specific checkpoint detail
   * @param {string} checkpointId
   * @returns {Object|null}
   */
  getCheckpoint(checkpointId) {
    return this.checkpoints.find((c) => c.id === checkpointId) || null;
  }

  /** Clear all checkpoints */
  clearAll() {
    this.checkpoints = [];
    this._save();
  }

  /** @private Load from localStorage */
  _load() {
    try {
      const raw = localStorage.getItem(CHECKPOINT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** @private Save to localStorage */
  _save() {
    try {
      localStorage.setItem(CHECKPOINT_STORAGE_KEY, JSON.stringify(this.checkpoints));
    } catch {
      // Storage full fallback: trim oldest
      this.checkpoints = this.checkpoints.slice(0, 10);
      try {
        localStorage.setItem(CHECKPOINT_STORAGE_KEY, JSON.stringify(this.checkpoints));
      } catch {
        // Silently fail
      }
    }
  }
}

export const checkpointManager = new CheckpointManager();
export default checkpointManager;
