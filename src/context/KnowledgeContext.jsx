import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import authorization from "../services/auth/authorization.js";
import { PERMISSIONS } from "../services/auth/permissionDefinitions.js";

// =======================================================
// KnowledgeContext.jsx
// Context provider managing flashcards, cheat sheets, and summaries
// Guarded state initialization for zero render crashes
// =======================================================

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

  // Flashcards state with Array validation
  const [flashcards, setFlashcards] = useState(() => {
    try {
      const saved = localStorage.getItem("knowledge_flashcards");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_FLASHCARDS;
    } catch {
      return SEED_FLASHCARDS;
    }
  });

  // AI Summaries state with Array validation
  const [summaries, setSummaries] = useState(() => {
    try {
      const saved = localStorage.getItem("knowledge_summaries");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_SUMMARIES;
    } catch {
      return SEED_SUMMARIES;
    }
  });

  // Sync to local storage
  useEffect(() => {
    if (Array.isArray(flashcards)) {
      localStorage.setItem("knowledge_flashcards", JSON.stringify(flashcards));
    }
  }, [flashcards]);

  useEffect(() => {
    if (Array.isArray(summaries)) {
      localStorage.setItem("knowledge_summaries", JSON.stringify(summaries));
    }
  }, [summaries]);

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
      nextReviewDue: new Date().toISOString().split("T")[0]
    };
    setFlashcards((prev) => [newCard, ...(Array.isArray(prev) ? prev : [])]);
  };

  const reviewFlashcard = (id, score) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_KNOWLEDGE)) {
      return;
    }
    setFlashcards((prev) =>
      (Array.isArray(prev) ? prev : []).map((c) => {
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
            nextReviewDue: next.toISOString().split("T")[0]
          };
        }
        return c;
      })
    );
  };

  // Summaries actions
  const toggleFavoriteSummary = (id) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_KNOWLEDGE)) {
      return;
    }
    setSummaries((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) => (s && s.id === id ? { ...s, favorite: !s.favorite } : s))
    );
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
      favorite: false
    };
    setSummaries((prev) => [newSummary, ...(Array.isArray(prev) ? prev : [])]);
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
