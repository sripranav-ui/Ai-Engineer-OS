/**
 * @file progressTracker.js
 * @description Progress Tracker for AI Agent Execution Pipeline.
 * Tracks execution state, step transitions, and emits progress events for UI rendering.
 */

import eventBus from "../../plugins/eventBus.js";

const PROGRESS_STATES = {
  IDLE: "idle",
  PLANNING: "planning",
  SCANNING_PROJECT: "scanning_project",
  INDEXING: "indexing",
  CREATING_FILES: "creating_files",
  EDITING_FILES: "editing_files",
  RUNNING_VALIDATION: "running_validation",
  GENERATING_DIFFS: "generating_diffs",
  AWAITING_APPROVAL: "awaiting_approval",
  COMMITTING_CHECKPOINT: "committing_checkpoint",
  COMPLETED: "completed",
  FAILED: "failed",
};

class ProgressTracker {
  constructor() {
    this.activeTaskId = null;
    this.state = PROGRESS_STATES.IDLE;
    this.steps = [];
    this.startTime = null;
    this.listeners = new Set();
  }

  /**
   * Begin tracking a new agent execution
   * @param {string} taskId
   * @param {string} description
   */
  start(taskId, description = "") {
    this.activeTaskId = taskId;
    this.state = PROGRESS_STATES.PLANNING;
    this.startTime = performance.now();
    this.steps = [
      {
        state: PROGRESS_STATES.PLANNING,
        label: "Planning execution...",
        description,
        timestamp: Date.now(),
        status: "active",
      },
    ];
    this._emit();
  }

  /**
   * Transition to a new progress state
   * @param {string} newState - One of PROGRESS_STATES
   * @param {string} [label] - Human-readable label
   * @param {Object} [metadata] - Extra metadata for step
   */
  transition(newState, label = "", metadata = {}) {
    // Mark previous active step as completed
    this.steps = this.steps.map((s) =>
      s.status === "active" ? { ...s, status: "completed", completedAt: Date.now() } : s
    );

    this.state = newState;
    this.steps.push({
      state: newState,
      label: label || newState.replace(/_/g, " "),
      timestamp: Date.now(),
      status: "active",
      ...metadata,
    });
    this._emit();
  }

  /**
   * Mark current execution as completed
   * @param {Object} [result] - Final execution result metadata
   */
  complete(result = {}) {
    this.steps = this.steps.map((s) =>
      s.status === "active" ? { ...s, status: "completed", completedAt: Date.now() } : s
    );

    this.state = PROGRESS_STATES.COMPLETED;
    this.steps.push({
      state: PROGRESS_STATES.COMPLETED,
      label: "Execution completed",
      timestamp: Date.now(),
      status: "completed",
      durationMs: Math.round(performance.now() - (this.startTime || 0)),
      ...result,
    });
    this._emit();
  }

  /**
   * Mark current execution as failed
   * @param {string} errorMessage
   */
  fail(errorMessage = "Unknown error") {
    this.steps = this.steps.map((s) =>
      s.status === "active" ? { ...s, status: "failed", completedAt: Date.now() } : s
    );

    this.state = PROGRESS_STATES.FAILED;
    this.steps.push({
      state: PROGRESS_STATES.FAILED,
      label: `Failed: ${errorMessage}`,
      timestamp: Date.now(),
      status: "failed",
    });
    this._emit();
  }

  /**
   * Get current progress snapshot
   * @returns {{ taskId: string, state: string, steps: Array, elapsedMs: number }}
   */
  getSnapshot() {
    return {
      taskId: this.activeTaskId,
      state: this.state,
      steps: [...this.steps],
      elapsedMs: this.startTime ? Math.round(performance.now() - this.startTime) : 0,
    };
  }

  /**
   * Subscribe to progress updates
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /** Reset tracker to idle */
  reset() {
    this.activeTaskId = null;
    this.state = PROGRESS_STATES.IDLE;
    this.steps = [];
    this.startTime = null;
    this._emit();
  }

  /** Internal: emit progress event */
  _emit() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch {
        // Swallow listener errors
      }
    });
    eventBus.emit("AGENT_PROGRESS", snapshot);
  }
}

export const AGENT_PROGRESS_STATES = PROGRESS_STATES;
export const progressTracker = new ProgressTracker();
export default progressTracker;
