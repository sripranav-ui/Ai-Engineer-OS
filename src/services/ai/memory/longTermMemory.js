// =======================================================
// longTermMemory.js — Persisted Long-Term Memory Engine
// =======================================================
// Manages persistent user preferences, custom AI instructions,
// learned skills profile, career targets, and pinned items.
// =======================================================

import storageAdapter from "./storage/storageAdapter.js";
import { createLongTermMemoryShape } from "./types.js";
import logger from "../../../utils/logger.js";

const STORAGE_KEY = "ai_long_term_memory_v2";

class LongTermMemoryStore {
  /** Get persistent long-term memory */
  getMemory() {
    return storageAdapter.get(STORAGE_KEY, createLongTermMemoryShape());
  }

  /** Update long-term memory */
  updateMemory(partialData) {
    const current = this.getMemory();
    const updated = {
      ...current,
      ...partialData,
      updatedAt: new Date().toISOString(),
    };

    const saved = storageAdapter.set(STORAGE_KEY, updated);
    if (saved) {
      logger.info("[LongTermMemory] Saved long-term memory update.");
    }
    return updated;
  }

  /** Set custom instructions */
  setCustomInstructions(instructions) {
    return this.updateMemory({ customInstructions: instructions });
  }

  /** Set target career role */
  setTargetRole(targetRole) {
    return this.updateMemory({ targetRole });
  }

  /** Pin memory item */
  pinItem(item) {
    const current = this.getMemory();
    const pinnedNotes = [item, ...current.pinnedNotes.filter((p) => p.id !== item.id)];
    return this.updateMemory({ pinnedNotes });
  }

  /** Unpin memory item */
  unpinItem(itemId) {
    const current = this.getMemory();
    const pinnedNotes = current.pinnedNotes.filter((p) => p.id !== itemId);
    return this.updateMemory({ pinnedNotes });
  }
}

export const longTermMemory = new LongTermMemoryStore();
export default longTermMemory;
