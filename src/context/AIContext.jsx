import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import aiEngine from "../services/ai/aiEngine";
import logger from "../utils/logger";

export const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [settings, setSettings] = useState(() => aiEngine.settings.getSettings());
  const [conversations, setConversations] = useState(() => aiEngine.conversations.getConversations());
  const [activeChatId, setActiveChatId] = useState(() => {
    const list = aiEngine.conversations.getConversations();
    return list.length > 0 ? list[0].id : null;
  });
  const [activeRole, setActiveRole] = useState("mentor");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamText, setCurrentStreamText] = useState("");

  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || conversations[0] || null;
  }, [conversations, activeChatId]);

  // Update settings helper
  const updateSettings = useCallback((partial) => {
    const next = aiEngine.settings.updateSettings(partial);
    setSettings(next);
  }, []);

  // New Chat session helper
  const createNewChat = useCallback((title = "New AI Conversation") => {
    const newChat = aiEngine.conversations.createConversation(title);
    setConversations(aiEngine.conversations.getConversations());
    setActiveChatId(newChat.id);
    return newChat;
  }, []);

  // Send message helper
  const sendMessage = useCallback(
    async (userQuery) => {
      if (!userQuery.trim() || isStreaming) return;

      if (!activeChatId) {
        const newChat = createNewChat("New Conversation");
        await aiEngine.sendMessage({
          userQuery,
          conversationId: newChat.id,
          roleId: activeRole,
          onChunk: (chunk) => {
            setIsStreaming(true);
            setCurrentStreamText((prev) => prev + chunk);
          },
          onComplete: () => {
            setIsStreaming(false);
            setCurrentStreamText("");
            setConversations(aiEngine.conversations.getConversations());
          },
        });
      } else {
        await aiEngine.sendMessage({
          userQuery,
          conversationId: activeChatId,
          roleId: activeRole,
          onChunk: (chunk) => {
            setIsStreaming(true);
            setCurrentStreamText((prev) => prev + chunk);
          },
          onComplete: () => {
            setIsStreaming(false);
            setCurrentStreamText("");
            setConversations(aiEngine.conversations.getConversations());
          },
        });
      }
    },
    [activeChatId, activeRole, isStreaming, createNewChat]
  );

  // Delete chat session helper
  const deleteChat = useCallback((chatId) => {
    aiEngine.conversations.deleteConversation(chatId);
    const updated = aiEngine.conversations.getConversations();
    setConversations(updated);
    if (activeChatId === chatId) {
      setActiveChatId(updated.length > 0 ? updated[0].id : null);
    }
  }, [activeChatId]);

  // Execute AI tool helper
  const executeTool = useCallback(async (toolName, args) => {
    try {
      return await aiEngine.tools.executeTool(toolName, args);
    } catch (err) {
      logger.error("[AIContext] Tool execution failed:", err);
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      conversations,
      activeChat,
      activeChatId,
      setActiveChatId,
      activeRole,
      setActiveRole,
      isStreaming,
      currentStreamText,
      sendMessage,
      createNewChat,
      deleteChat,
      executeTool,
      availableTools: aiEngine.tools.getAvailableTools(),
    }),
    [settings, updateSettings, conversations, activeChat, activeChatId, activeRole, isStreaming, currentStreamText, sendMessage, createNewChat, deleteChat, executeTool]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an <AIProvider>");
  }
  return context;
}

export default AIContext;
