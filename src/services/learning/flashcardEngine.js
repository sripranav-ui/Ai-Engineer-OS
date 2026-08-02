// =======================================================
// flashcardEngine.js — Spaced Repetition Flashcard Engine
// =======================================================
// Manages flashcard decks, SuperMemo SM-2 readiness, user ratings
// (Again / Hard / Good / Easy), category filtering, and AI card generation.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

const FLASHCARDS_KEY = "learning_flashcards_deck";

const DEFAULT_FLASHCARDS = [
  {
    id: "fc_1",
    question: "What is the key difference between PyTorch 'tensor.detach()' and 'tensor.clone()'?",
    answer: "'detach()' returns a new tensor sharing storage but detached from computation graph. 'clone()' allocates new memory while retaining autograd graph history.",
    category: "PyTorch & Deep Learning",
    difficulty: "Medium",
    interval: 1, // days
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
    bookmarked: false,
  },
  {
    id: "fc_2",
    question: "How does the Self-Attention mechanism calculate attention weights?",
    answer: "Query (Q) is multiplied by Transposed Key (K^T), scaled by sqrt(d_k), passed through Softmax, and multiplied by Value (V): Softmax(QK^T / sqrt(d_k)) * V.",
    category: "Transformers & LLMs",
    difficulty: "Hard",
    interval: 1,
    easeFactor: 2.5,
    dueDate: new Date().toISOString(),
    bookmarked: true,
  },
  {
    id: "fc_3",
    question: "What is Cosine Similarity in Vector Search?",
    answer: "Measures cosine of the angle between two vectors: (A · B) / (||A|| ||B||). Ranges from -1 to 1.",
    category: "Vector DBs & RAG",
    difficulty: "Easy",
    interval: 3,
    easeFactor: 2.6,
    dueDate: new Date().toISOString(),
    bookmarked: false,
  },
];

export const flashcardEngine = {
  /** Get all flashcards from storage */
  getDeck: () => {
    try {
      const raw = storageService.get(FLASHCARDS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_FLASHCARDS;
    } catch {
      return DEFAULT_FLASHCARDS;
    }
  },

  /** Save deck to storage */
  saveDeck: (deck) => {
    try {
      storageService.set(FLASHCARDS_KEY, JSON.stringify(deck));
    } catch (err) {
      logger.error("[FlashcardEngine] Error saving deck:", err);
    }
  },

  /** Get cards due for review today */
  getDueCards: () => {
    const deck = flashcardEngine.getDeck();
    const now = new Date();
    return deck.filter((card) => new Date(card.dueDate) <= now);
  },

  /** Update card SuperMemo SM-2 rating (1: Again, 2: Hard, 3: Good, 4: Easy) */
  rateCard: (cardId, rating) => {
    const deck = flashcardEngine.getDeck();
    const updated = deck.map((card) => {
      if (card.id !== cardId) return card;

      let ease = card.easeFactor || 2.5;
      let interval = card.interval || 1;

      // SM-2 Ease adjustment
      ease = ease + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
      if (ease < 1.3) ease = 1.3;

      if (rating < 3) {
        interval = 1;
      } else {
        interval = Math.round(interval * ease);
      }

      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + interval);

      return {
        ...card,
        easeFactor: ease,
        interval,
        dueDate: nextDue.toISOString(),
      };
    });

    flashcardEngine.saveDeck(updated);
    return updated;
  },

  /** Create custom or AI-generated flashcard */
  createCard: (question, answer, category = "General") => {
    const deck = flashcardEngine.getDeck();
    const newCard = {
      id: `fc_${Date.now()}`,
      question,
      answer,
      category,
      difficulty: "Medium",
      interval: 1,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      bookmarked: false,
    };
    deck.unshift(newCard);
    flashcardEngine.saveDeck(deck);
    return newCard;
  },

  /** Toggle bookmark on flashcard */
  toggleBookmark: (cardId) => {
    const deck = flashcardEngine.getDeck();
    const updated = deck.map((c) => (c.id === cardId ? { ...c, bookmarked: !c.bookmarked } : c));
    flashcardEngine.saveDeck(updated);
    return updated;
  },
};

export default flashcardEngine;
