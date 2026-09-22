import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import authorization from "../services/auth/authorization.js";
import { PERMISSIONS } from "../services/auth/permissionDefinitions.js";
import storageService from "../services/storageService.js";

export const KnowledgeContext = createContext();

const SEED_FLASHCARDS = [
  { id: 1, question: "What is the difference between yield and return in Python?", answer: "return terminates the function and passes back the result immediately. yield pauses the function, returning a generator that yields values lazily one-by-one, keeping its local execution state intact.", difficulty: "Medium", lastReviewed: null, nextReviewDue: new Date().toISOString().split("T")[0], category: "Python" },
  { id: 2, question: "How does the Central Limit Theorem (CLT) apply to sample sizes?", answer: "CLT states that the sampling distribution of the sample mean approaches a normal distribution as the sample size increases (generally n >= 30), regardless of the shape of the underlying population distribution.", difficulty: "Easy", lastReviewed: null, nextReviewDue: new Date().toISOString().split("T")[0], category: "Statistics" },
  { id: 3, question: "What does the softmax activation function output?", answer: "Softmax converts a vector of raw scores (logits) into a probability distribution where the sum of all elements equals exactly 1.0, highlighting the class with the highest probability value.", difficulty: "Easy", lastReviewed: null, nextReviewDue: new Date().toISOString().split("T")[0], category: "Deep Learning" }
];

const SEED_SUMMARIES = [
  { id: 1, title: "Attention Is All You Need (Transformer Architecture)", topic: "Deep Learning", tags: ["Transformers", "Attention", "SOTA"], content: "This paper introduced the Transformer architecture, replacing recurrent models entirely with self-attention networks. By processing inputs in parallel, it drastically cut training times and became the foundation of modern Large Language Models (LLMs).", readingTime: "4 min", favorite: true },
  { id: 2, title: "SQL Indexing & Query Optimizations", topic: "SQL", tags: ["Database", "Index", "Query Speed"], content: "A deep dive into B-Trees and Hash Indexes. Explains how query compilers look up rows, why indexing foreign keys speeds up joins, and rules to prevent full table scans in relational models.", readingTime: "3 min", favorite: false }
];

export function KnowledgeProvider({ children }) {
  const { user } = useContext(AuthContext) || {};
  const userId = user?.id || "guest";

  // Flashcards state with owner userId stamp
  const [flashcardsState, setFlashcardsState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("knowledge_flashcards", userId, SEED_FLASHCARDS),
  }));

  // AI Summaries state with owner userId stamp
  const [summariesState, setSummariesState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("knowledge_summaries", userId, SEED_SUMMARIES),
  }));

  // Re-hydrate when active user ID changes
  useEffect(() => {
    const freshCards = storageService.getInitialScopedData("knowledge_flashcards", userId, SEED_FLASHCARDS);
    const freshSummaries = storageService.getInitialScopedData("knowledge_summaries", userId, SEED_SUMMARIES);
    setFlashcardsState({ userId, data: freshCards });
    setSummariesState({ userId, data: freshSummaries });
  }, [userId]);

  // Sync to user-scoped local storage ONLY when state matches active user
  useEffect(() => {
    if (flashcardsState.userId !== userId) return;
    if (Array.isArray(flashcardsState.data)) {
      const key = storageService.getUserKey("knowledge_flashcards", userId);
      storageService.set(key, JSON.stringify(flashcardsState.data));
    }
  }, [flashcardsState, userId]);

  useEffect(() => {
    if (summariesState.userId !== userId) return;
    if (Array.isArray(summariesState.data)) {
      const key = storageService.getUserKey("knowledge_summaries", userId);
      storageService.set(key, JSON.stringify(summariesState.data));
    }
  }, [summariesState, userId]);

  const flashcards = flashcardsState.userId === userId ? flashcardsState.data : SEED_FLASHCARDS;
  const summaries = summariesState.userId === userId ? summariesState.data : SEED_SUMMARIES;

  // Flashcards actions
  const addFlashcard = (q, a, category) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_KNOWLEDGE)) {
      return;
    }
    const newCard = {
      id: Date.now(),
      question: q,
      answer: a,
      category,
      difficulty: "Medium",
      lastReviewed: null,
      nextReviewDue: new Date().toISOString().split("T")[0],
    };
    setFlashcardsState((prev) => ({
      userId,
      data: [newCard, ...(Array.isArray(prev?.data) ? prev.data : [])],
    }));
  };

  const reviewFlashcard = (id, score) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_KNOWLEDGE)) {
      return;
    }
    setFlashcardsState((prev) => ({
      userId,
      data: (Array.isArray(prev?.data) ? prev.data : []).map((c) => {
        if (c && c.id === id) {
          let addDays = 1;
          if (score === "Easy") addDays = 7;
          if (score === "Medium") addDays = 3;

          const next = new Date();
          next.setDate(next.getDate() + addDays);

          return {
            ...c,
            difficulty: score,
            lastReviewed: new Date().toISOString().split("T")[0],
            nextReviewDue: next.toISOString().split("T")[0],
          };
        }
        return c;
      }),
    }));
  };

  // Summaries actions
  const toggleFavoriteSummary = (id) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_KNOWLEDGE)) {
      return;
    }
    setSummariesState((prev) => ({
      userId,
      data: (Array.isArray(prev?.data) ? prev.data : []).map((s) => (s && s.id === id ? { ...s, favorite: !s.favorite } : s)),
    }));
  };

  const addSummary = (title, topic, content, tagsStr) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_KNOWLEDGE)) {
      return;
    }
    const newSummary = {
      id: Date.now(),
      title,
      topic,
      tags: String(tagsStr || "").split(",").map((t) => t.trim()).filter(Boolean),
      content,
      readingTime: `${Math.max(1, Math.round((content || "").split(" ").length / 150))} min`,
      favorite: false,
    };
    setSummariesState((prev) => ({
      userId,
      data: [newSummary, ...(Array.isArray(prev?.data) ? prev.data : [])],
    }));
  };

  return (
    <KnowledgeContext.Provider
      value={{
        flashcards: Array.isArray(flashcards) ? flashcards : SEED_FLASHCARDS,
        addFlashcard,
        reviewFlashcard,
        summaries: Array.isArray(summaries) ? summaries : SEED_SUMMARIES,
        toggleFavoriteSummary,
        addSummary
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export default KnowledgeContext;
