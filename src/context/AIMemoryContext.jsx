import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import shortTermMemory from "../services/ai/memory/shortTermMemory.js";
import longTermMemory from "../services/ai/memory/longTermMemory.js";
import conversationMemory from "../services/ai/memory/conversationMemory.js";
import workspaceContextService from "../services/ai/memory/workspaceContextService.js";
import contextBuilderService from "../services/ai/memory/contextBuilderService.js";

export const AIMemoryContext = createContext(null);

export function AIMemoryProvider({ children }) {
  const [shortTerm, setShortTerm] = useState(() => shortTermMemory.getMemory());
  const [longTerm, setLongTerm]   = useState(() => longTermMemory.getMemory());
  const [conversations, setConversations] = useState(() => conversationMemory.getAllConversations());
  const [workspaceCtx, setWorkspaceCtx]   = useState(() => workspaceContextService.getContext());

  // Listen to route changes
  const updateActivePage = useCallback((route) => {
    shortTermMemory.setActivePage(route);
    setShortTerm(shortTermMemory.getMemory());
  }, []);

  // Update selection
  const updateSelectedText = useCallback((text) => {
    shortTermMemory.setSelectedText(text);
    setShortTerm(shortTermMemory.getMemory());
  }, []);

  // Set custom instructions
  const setCustomInstructions = useCallback((instructions) => {
    const updated = longTermMemory.setCustomInstructions(instructions);
    setLongTerm(updated);
  }, []);

  // Build context payload for active session
  const buildAIContext = useCallback((conversationId) => {
    return contextBuilderService.buildContext(conversationId);
  }, []);

  // Build system prompt context string
  const formatSystemContext = useCallback((conversationId) => {
    return contextBuilderService.formatSystemPromptContext(conversationId);
  }, []);

  const value = useMemo(
    () => ({
      shortTerm,
      longTerm,
      conversations,
      workspaceCtx,
      updateActivePage,
      updateSelectedText,
      setCustomInstructions,
      buildAIContext,
      formatSystemContext,
      pinNote: (note) => setLongTerm(longTermMemory.pinItem(note)),
      addLearnedConcept: (concept) => setLongTerm(longTermMemory.addLearnedConcept(concept)),
      setActiveProject: (proj) => setWorkspaceCtx(workspaceContextService.setActiveProject(proj)),
    }),
    [shortTerm, longTerm, conversations, workspaceCtx, updateActivePage, updateSelectedText, setCustomInstructions, buildAIContext, formatSystemContext]
  );

  return <AIMemoryContext.Provider value={value}>{children}</AIMemoryContext.Provider>;
}

export function useAIMemory() {
  const ctx = useContext(AIMemoryContext);
  if (!ctx) throw new Error("useAIMemory must be used within an <AIMemoryProvider>");
  return ctx;
}

export default AIMemoryContext;
