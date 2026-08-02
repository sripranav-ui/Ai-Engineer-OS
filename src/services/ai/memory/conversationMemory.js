// =======================================================
// conversationMemory.js — Conversation Memory & Session History
// =======================================================
// Manages chat message streams, token usage, model IDs,
// conversation metadata, summaries, pinning, and deletion.
// =======================================================

import storageAdapter from "./storage/storageAdapter.js";
import { createConversationMessageShape } from "./types.js";
import logger from "../../../utils/logger.js";

const CONVERSATIONS_KEY = "ai_conversation_memory_v2";

const DEFAULT_SESSIONS = [
  {
    id: "session_welcome_1",
    title: "AI Engineer OS System Setup",
    modelId: "gpt-4o",
    messages: [
      {
        id: "msg_init_1",
        sender: "assistant",
        text: "Welcome to AI Engineer OS! System subsystems are online and ready for autonomous operations.",
        timestamp: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];

class ConversationMemoryStore {
  /** Get all stored conversation sessions sorted by pinned status and updatedAt */
  getAllConversations() {
    const raw = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    return [...raw].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }

  /** Get conversation by ID */
  getConversation(id) {
    const list = this.getAllConversations();
    return list.find((c) => c.id === id) || null;
  }

  /** Create new conversation session */
  createConversation(title = "New Chat", modelId = "gpt-4o", provider = "openai") {
    const list = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newSession = {
      id,
      title,
      provider,
      modelId,
      pinned: false,
      messages: [],
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newSession);
    storageAdapter.set(CONVERSATIONS_KEY, list);
    logger.info(`[ConversationMemory] Created session "${id}": ${title}`);
    return newSession;
  }

  /** Update conversation model and provider */
  updateConversationModel(conversationId, provider, modelId) {
    const list = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    const index = list.findIndex((c) => c.id === conversationId);
    if (index !== -1) {
      if (provider) list[index].provider = provider;
      if (modelId) list[index].modelId = modelId;
      list[index].updatedAt = new Date().toISOString();
      storageAdapter.set(CONVERSATIONS_KEY, list);
      logger.info(`[ConversationMemory] Updated model for "${conversationId}": ${provider}/${modelId}`);
    }
  }

  /** Append message to conversation */
  addMessage(conversationId, messageData) {
    const list = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    const index = list.findIndex((c) => c.id === conversationId);

    if (index !== -1) {
      const msg = createConversationMessageShape(messageData);
      list[index].messages.push(msg);
      list[index].updatedAt = new Date().toISOString();
      storageAdapter.set(CONVERSATIONS_KEY, list);
      return msg;
    }
    return null;
  }

  /** Toggle pin status of a conversation */
  togglePin(conversationId) {
    const list = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    const index = list.findIndex((c) => c.id === conversationId);
    if (index !== -1) {
      list[index].pinned = !list[index].pinned;
      list[index].updatedAt = new Date().toISOString();
      storageAdapter.set(CONVERSATIONS_KEY, list);
      logger.info(`[ConversationMemory] Toggled pin for session "${conversationId}": ${list[index].pinned}`);
    }
  }

  /** Rename conversation */
  renameConversation(conversationId, newTitle) {
    if (!newTitle || !newTitle.trim()) return;
    const list = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    const index = list.findIndex((c) => c.id === conversationId);
    if (index !== -1) {
      list[index].title = newTitle.trim();
      list[index].updatedAt = new Date().toISOString();
      storageAdapter.set(CONVERSATIONS_KEY, list);
      logger.info(`[ConversationMemory] Renamed session "${conversationId}" to: "${newTitle}"`);
    }
  }

  /** Delete conversation by ID */
  deleteConversation(conversationId) {
    const list = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    const updated = list.filter((c) => c.id !== conversationId);
    storageAdapter.set(CONVERSATIONS_KEY, updated);
    logger.info(`[ConversationMemory] Deleted session "${conversationId}".`);
  }

  /** Search conversations by title, user messages, or assistant messages (case-insensitive) */
  searchConversations(query = "") {
    const list = this.getAllConversations();
    if (!query || !query.trim()) return list;

    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      const matchTitle = (c.title || "").toLowerCase().includes(q);
      const matchMessage = (c.messages || []).some((m) =>
        (m.text || m.content || "").toLowerCase().includes(q)
      );
      return matchTitle || matchMessage;
    });
  }

  /** Export formatted conversation payload */
  exportConversation(conversationId) {
    const conv = this.getConversation(conversationId);
    if (!conv) return null;

    return {
      id: conv.id,
      title: conv.title || "Untitled Conversation",
      pinned: !!conv.pinned,
      createdAt: conv.createdAt || conv.updatedAt || new Date().toISOString(),
      updatedAt: conv.updatedAt || new Date().toISOString(),
      model: conv.modelId || "gpt-4o",
      messages: conv.messages || [],
    };
  }

  /** Import raw JSON object or array of objects with schema validation & duplicate ID handling */
  importConversations(rawData) {
    let items = Array.isArray(rawData) ? rawData : [rawData];
    const list = storageAdapter.get(CONVERSATIONS_KEY, DEFAULT_SESSIONS);
    const existingIds = new Set(list.map((c) => c.id));

    let importedCount = 0;
    const toInsert = [];

    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      // Validate schema requirements
      if (!item.title && (!item.messages || !Array.isArray(item.messages))) continue;

      let targetId = item.id;
      if (!targetId || existingIds.has(targetId)) {
        targetId = `session_imported_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      }

      const validSession = {
        id: targetId,
        title: item.title || "Imported Conversation",
        pinned: !!item.pinned,
        modelId: item.model || item.modelId || "gpt-4o",
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        messages: Array.isArray(item.messages) ? item.messages : [],
      };

      existingIds.add(targetId);
      toInsert.push(validSession);
      importedCount++;
    }

    if (importedCount > 0) {
      const updatedList = [...toInsert, ...list];
      storageAdapter.set(CONVERSATIONS_KEY, updatedList);
      logger.info(`[ConversationMemory] Imported ${importedCount} conversation(s).`);
    }

    return importedCount;
  }

  /** Clear all conversations and create a fresh initial thread */
  clearAllConversations() {
    storageAdapter.remove(CONVERSATIONS_KEY);
    const freshList = [
      {
        id: `session_${Date.now()}`,
        title: "New AI Conversation",
        modelId: "gpt-4o",
        pinned: false,
        messages: [
          {
            id: `msg_${Date.now()}`,
            sender: "assistant",
            text: "Hello! I'm your AI Engineer OS assistant. How can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    storageAdapter.set(CONVERSATIONS_KEY, freshList);
    logger.info("[ConversationMemory] Cleared all conversations and initialized fresh session.");
    return freshList[0];
  }
}

export const conversationMemory = new ConversationMemoryStore();
export default conversationMemory;
