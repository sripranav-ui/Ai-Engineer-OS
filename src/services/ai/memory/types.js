// =======================================================
// types.js — AI Memory & Context Architecture Data Models
// =======================================================
// Strongly typed contracts & enumerations for Short-Term Memory,
// Long-Term Memory, Workspace Context, Conversation Memory,
// and Prioritized Context Payloads.
// =======================================================

/**
 * Memory Priority Levels for AI Context Assembly
 */
export const MEMORY_PRIORITY = {
  CURRENT_PAGE:         1, // Highest priority
  CURRENT_PROJECT:      2,
  CURRENT_CONVERSATION: 3,
  PINNED_MEMORY:        4,
  LONG_TERM_MEMORY:     5,
  ARCHIVED_MEMORY:      6, // Lowest priority
};

/**
 * Short-Term Memory Data Shape
 * Represents transient, session-bound state with automatic TTL expiration.
 */
export const createShortTermMemoryShape = (data = {}) => ({
  activePage:        data.activePage || "/",
  selectedText:      data.selectedText || "",
  activeFile:        data.activeFile || null,
  recentPrompts:     data.recentPrompts || [],
  recentCommands:    data.recentCommands || [],
  currentSelection:  data.currentSelection || null,
  expiresAt:         data.expiresAt || Date.now() + 1800000, // 30 mins TTL
});

/**
 * Long-Term Memory Data Shape
 * Represents persistent user preferences, goals, custom instructions, and pinned items.
 */
export const createLongTermMemoryShape = (data = {}) => ({
  userGoals:          data.userGoals || [],
  preferredLanguages: data.preferredLanguages || ["Python", "JavaScript"],
  targetRole:         data.targetRole || "AI Specialist",
  customInstructions: data.customInstructions || "",
  pinnedNotes:        data.pinnedNotes || [],
  learnedConcepts:    data.learnedConcepts || [],
  frequentlyUsed:     data.frequentlyUsed || [],
});

/**
 * Workspace Context Data Shape
 * Live state of current workspace navigation, filters, and active items.
 */
export const createWorkspaceContextShape = (data = {}) => ({
  workspaceId:    data.workspaceId || "default",
  currentRoute:   data.currentRoute || "/",
  activeProject:  data.activeProject || null,
  selectedTask:   data.selectedTask || null,
  activeFilters:  data.activeFilters || {},
  currentTab:     data.currentTab || "overview",
  searchQuery:    data.searchQuery || "",
  updatedAt:      new Date().toISOString(),
});

/**
 * Conversation Message Data Shape
 */
export const createConversationMessageShape = (data = {}) => ({
  id:        data.id || `msg_${Date.now()}`,
  role:      data.role || "user", // "user" | "assistant" | "system"
  content:   data.content || "",
  timestamp: data.timestamp || new Date().toISOString(),
  model:     data.model || "gpt-4o",
  tokens:    data.tokens || 0,
});

/**
 * Compiled Context Payload Shape
 */
export const createContextPayloadShape = (data = {}) => ({
  priorityOrder: [
    MEMORY_PRIORITY.CURRENT_PAGE,
    MEMORY_PRIORITY.CURRENT_PROJECT,
    MEMORY_PRIORITY.CURRENT_CONVERSATION,
    MEMORY_PRIORITY.PINNED_MEMORY,
    MEMORY_PRIORITY.LONG_TERM_MEMORY,
    MEMORY_PRIORITY.ARCHIVED_MEMORY,
  ],
  workspace:     data.workspace || {},
  project:       data.project || null,
  shortTerm:     data.shortTerm || {},
  conversation:  data.conversation || [],
  pinned:        data.pinned || [],
  longTerm:      data.longTerm || {},
  preferences:   data.preferences || {},
  compiledAt:    new Date().toISOString(),
});
