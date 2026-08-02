// =======================================================
// shortTermMemory.js — Auto-Expiring Session Memory Store
// =======================================================
// Manages transient, session-bound memory with automatic TTL
// expiration (active route, selected text, active file, active workflow, recent prompts).
// =======================================================

import { createShortTermMemoryShape } from "./types.js";
import logger from "../../../utils/logger.js";

const DEFAULT_TTL_MS = 1800000; // 30 minutes

class ShortTermMemoryStore {
  constructor() {
    this.memory = createShortTermMemoryShape();
    this.activeWorkflow = null;
  }

  /**
   * Check if short-term memory has expired and reset if needed
   */
  checkExpiration() {
    if (Date.now() > this.memory.expiresAt) {
      logger.info("[ShortTermMemory] Memory TTL expired. Resetting transient state.");
      this.clear();
    }
  }

  /** Get active short-term memory snapshot */
  getMemory() {
    this.checkExpiration();
    return { ...this.memory, activeWorkflow: this.activeWorkflow };
  }

  /** Set active route */
  setActivePage(pageRoute) {
    this.checkExpiration();
    this.memory.activePage = pageRoute;
    this.touchTTL();
  }

  /** Set active text selection */
  setSelectedText(text) {
    this.checkExpiration();
    this.memory.selectedText = text;
    this.touchTTL();
  }

  /** Set active open file */
  setActiveFile(fileObj) {
    this.checkExpiration();
    this.memory.activeFile = fileObj;
    this.touchTTL();
  }

  /** Set active workflow state */
  setActiveWorkflow(workflowData) {
    this.checkExpiration();
    this.activeWorkflow = workflowData;
    this.touchTTL();
  }

  /** Add recent user prompt */
  addRecentPrompt(prompt) {
    this.checkExpiration();
    const prompts = [prompt, ...this.memory.recentPrompts.filter((p) => p !== prompt)].slice(0, 5);
    this.memory.recentPrompts = prompts;
    this.touchTTL();
  }

  /** Refresh TTL expiration timestamp */
  touchTTL() {
    this.memory.expiresAt = Date.now() + DEFAULT_TTL_MS;
  }

  /** Clear short-term memory */
  clear() {
    this.memory = createShortTermMemoryShape();
    this.activeWorkflow = null;
  }
}

export const shortTermMemory = new ShortTermMemoryStore();
export default shortTermMemory;
