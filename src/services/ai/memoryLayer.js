// =======================================================
// memoryLayer.js — Multi-Tiered AI Memory Architecture
// =======================================================
// Manages 4 memory layers:
//   1. Short-Term Memory  — Active UI session context
//   2. Conversation Memory — Recent messages in current chat
//   3. Workspace Memory    — Active workspace/project state
//   4. Long-Term Memory    — User preferences, skills & career target
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

const MEMORY_STORAGE_KEY = "ai_long_term_memory";

const shortTermMemoryStore = {};

export const memoryLayer = {
  // ─── 1. Short-Term Memory (In-Memory Session) ───────────────

  setShortTerm: (key, value) => {
    shortTermMemoryStore[key] = value;
  },

  getShortTerm: (key, fallback = null) => {
    return shortTermMemoryStore[key] !== undefined ? shortTermMemoryStore[key] : fallback;
  },

  clearShortTerm: () => {
    Object.keys(shortTermMemoryStore).forEach((k) => delete shortTermMemoryStore[k]);
  },

  // ─── 2. Workspace Memory ──────────────────────────────────────

  getWorkspaceMemory: (workspaceId) => {
    try {
      const key = `ai_ws_mem_${workspaceId}`;
      const raw = storageService.get(key);
      return raw ? JSON.parse(raw) : { notes: [], pinnedContext: "" };
    } catch {
      return { notes: [], pinnedContext: "" };
    }
  },

  setWorkspaceMemory: (workspaceId, data) => {
    try {
      const key = `ai_ws_mem_${workspaceId}`;
      storageService.set(key, JSON.stringify(data));
    } catch (err) {
      logger.error("[MemoryLayer] Error saving workspace memory:", err);
    }
  },

  // ─── 3. Long-Term Memory (Persisted User Profile & Skills) ───

  getLongTermMemory: () => {
    try {
      const raw = storageService.get(MEMORY_STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : {
            userGoals: [],
            preferredLanguages: ["Python", "JavaScript"],
            targetRole: "AI Engineer",
            learnedConcepts: [],
            customInstructions: "",
          };
    } catch {
      return {};
    }
  },

  updateLongTermMemory: (partial) => {
    const current = memoryLayer.getLongTermMemory();
    const next = { ...current, ...partial };
    storageService.set(MEMORY_STORAGE_KEY, JSON.stringify(next));
    logger.info("[MemoryLayer] Long-term memory updated.");
    return next;
  },

  clearAllMemory: () => {
    memoryLayer.clearShortTerm();
    storageService.remove(MEMORY_STORAGE_KEY);
    logger.info("[MemoryLayer] All AI memory cleared.");
  },
};

export default memoryLayer;
