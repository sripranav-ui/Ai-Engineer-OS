// =======================================================
// conversationEngine.js — Multi-Chat Management & History
// =======================================================
// Manages multiple chat sessions, message histories, timestamps,
// per-conversation knowledge base toggles, chat renaming, pinning, deletion, search, and storage.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

const CONVERSATIONS_KEY = "ai_conversations_meta";

const DEFAULT_CONVERSATIONS = [
  {
    id: "default-chat-1",
    title: "AI Engineer Architecture Setup",
    pinned: true,
    useKnowledgeBase: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      { id: "m1", role: "assistant", content: "Welcome to AI Engineer OS! How can I assist with your workspace or architecture today?", timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
  },
];

export const conversationEngine = {
  /** Get all conversations metadata list */
  getConversations: () => {
    try {
      const raw = storageService.get(CONVERSATIONS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_CONVERSATIONS;
    } catch {
      return DEFAULT_CONVERSATIONS;
    }
  },

  /** Save conversations metadata list */
  saveConversations: (list) => {
    try {
      storageService.set(CONVERSATIONS_KEY, JSON.stringify(list));
    } catch (err) {
      logger.error("[ConversationEngine] Error saving conversations:", err);
    }
  },

  /** Get specific conversation by ID */
  getConversation: (conversationId) => {
    const list = conversationEngine.getConversations();
    return list.find((c) => c.id === conversationId) || null;
  },

  /** Create a new chat session */
  createConversation: (title = "New AI Conversation") => {
    const list = conversationEngine.getConversations();
    const newChat = {
      id: `chat_${Date.now()}`,
      title,
      pinned: false,
      useKnowledgeBase: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        { id: `m_${Date.now()}`, role: "assistant", content: `Hello! I'm your AI Engineer OS assistant. What would you like to work on?`, timestamp: new Date().toISOString() },
      ],
    };
    const updated = [newChat, ...list];
    conversationEngine.saveConversations(updated);
    return newChat;
  },

  /** Toggle per-conversation Use Knowledge Base flag */
  toggleKnowledgeBase: (conversationId) => {
    const list = conversationEngine.getConversations();
    let newState = true;
    const updated = list.map((c) => {
      if (c.id === conversationId) {
        newState = !(c.useKnowledgeBase !== false);
        return { ...c, useKnowledgeBase: newState };
      }
      return c;
    });
    conversationEngine.saveConversations(updated);
    logger.info(`[ConversationEngine] Chat "${conversationId}" Knowledge Base set to: ${newState}`);
    return newState;
  },

  /** Append a message to a chat session */
  appendMessage: (conversationId, role, content) => {
    const list = conversationEngine.getConversations();
    const updated = list.map((chat) => {
      if (chat.id !== conversationId) return chat;
      const newMsg = { id: `m_${Date.now()}`, role, content, timestamp: new Date().toISOString() };
      return {
        ...chat,
        updatedAt: new Date().toISOString(),
        messages: [...chat.messages, newMsg],
      };
    });
    conversationEngine.saveConversations(updated);
    return updated.find((c) => c.id === conversationId);
  },

  /** Rename conversation */
  renameConversation: (conversationId, newTitle) => {
    const list = conversationEngine.getConversations();
    const updated = list.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c));
    conversationEngine.saveConversations(updated);
  },

  /** Pin/Unpin conversation */
  togglePin: (conversationId) => {
    const list = conversationEngine.getConversations();
    const updated = list.map((c) => (c.id === conversationId ? { ...c, pinned: !c.pinned } : c));
    conversationEngine.saveConversations(updated);
  },

  /** Delete conversation */
  deleteConversation: (conversationId) => {
    const list = conversationEngine.getConversations();
    const updated = list.filter((c) => c.id !== conversationId);
    conversationEngine.saveConversations(updated);
  },

  /** Search conversations by title or message content */
  searchConversations: (query = "") => {
    const list = conversationEngine.getConversations();
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  },
};

export default conversationEngine;
