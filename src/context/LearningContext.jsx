import React, { createContext, useState, useContext, useMemo, useCallback } from "react";
import roadmapEngine from "../services/learning/roadmapEngine";
import progressEngine from "../services/learning/progressEngine";
import recommendationEngine from "../services/learning/recommendationEngine";
import flashcardEngine from "../services/learning/flashcardEngine";
import quizEngine from "../services/learning/quizEngine";
import bookmarkEngine from "../services/learning/bookmarkEngine";
import searchEngine from "../services/learning/searchEngine";
import aiLearningHelper from "../services/learning/aiLearningHelper";

export const LearningContext = createContext(null);

export function LearningProvider({ children }) {
  const [activeTrackId, setActiveTrackId] = useState("ai-engineering");
  const [deck, setDeck] = useState(() => flashcardEngine.getDeck());
  const [bookmarks, setBookmarks] = useState(() => bookmarkEngine.getBookmarks());
  const [metrics, setMetrics] = useState(() => progressEngine.getMetrics());

  // Refresh methods
  const refreshDeck = useCallback(() => setDeck(flashcardEngine.getDeck()), []);
  const refreshBookmarks = useCallback(() => setBookmarks(bookmarkEngine.getBookmarks()), []);
  const refreshMetrics = useCallback(() => setMetrics(progressEngine.getMetrics()), []);

  // Flashcard helpers
  const rateCard = useCallback((cardId, rating) => {
    flashcardEngine.rateCard(cardId, rating);
    refreshDeck();
  }, [refreshDeck]);

  const createCard = useCallback((question, answer, category) => {
    const card = flashcardEngine.createCard(question, answer, category);
    refreshDeck();
    return card;
  }, [refreshDeck]);

  // Bookmark helpers
  const toggleBookmark = useCallback((item) => {
    const updated = bookmarkEngine.toggleBookmark(item);
    setBookmarks(updated);
    return updated;
  }, []);

  // Quiz helper
  const evaluateQuiz = useCallback((quizId, answers) => {
    const result = quizEngine.evaluateQuiz(quizId, answers);
    refreshMetrics();
    return result;
  }, [refreshMetrics]);

  const value = useMemo(
    () => ({
      activeTrackId,
      setActiveTrackId,
      tracks: roadmapEngine.getTracks(),
      activeTrack: roadmapEngine.getTrack(activeTrackId),
      trackProgress: roadmapEngine.getTrackProgress(activeTrackId),
      metrics,
      recommendations: recommendationEngine.getRecommendations(),
      deck,
      dueCards: flashcardEngine.getDueCards(),
      rateCard,
      createCard,
      bookmarks,
      toggleBookmark,
      isBookmarked: bookmarkEngine.isBookmarked,
      evaluateQuiz,
      quizHistory: quizEngine.getHistory(),
      searchAll: searchEngine.searchAll,
      aiHelper: aiLearningHelper,
      logStudyTime: (mins) => {
        progressEngine.logStudyTime(mins);
        refreshMetrics();
      },
    }),
    [activeTrackId, metrics, deck, bookmarks, rateCard, createCard, toggleBookmark, evaluateQuiz, refreshMetrics]
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error("useLearning must be used inside <LearningProvider>");
  return ctx;
}

export default LearningContext;
