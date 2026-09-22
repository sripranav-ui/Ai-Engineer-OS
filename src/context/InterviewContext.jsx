import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import storageService from "../services/storageService.js";

// =======================================================
// InterviewContext.jsx
// Global context for Interview Preparation logs & mock history
// Guarded state initialization for zero render crashes
// =======================================================

export const InterviewContext = createContext();

const INITIAL_REVISION_NOTES = "## My Interview Cheat-sheet\nWrite Python built-ins, complex space-times, ML equations, and behavioral notes here.";

const INITIAL_MOCK_SESSIONS = [
  { id: 1, score: 85, category: "Core ML & Python", feedback: "Strong coding logic and Python details, but review backprop mathematics.", date: "2026-07-16" }
];

export function InterviewProvider({ children }) {
  const { user } = useContext(AuthContext) || {};
  const userId = user?.id || "guest";

  // --- 1. Completed Questions State (stamped with owner userId) ---
  const [completedState, setCompletedState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("interview_completed_ids", userId, []),
  }));

  // --- 2. Bookmarked Questions State (stamped with owner userId) ---
  const [bookmarkedState, setBookmarkedState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("interview_bookmarked_ids", userId, []),
  }));

  // --- 3. Revision Notes State (stamped with owner userId) ---
  const [revisionNotesState, setRevisionNotesState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("interview_revision_notes", userId, INITIAL_REVISION_NOTES),
  }));

  // --- 4. Mock Sessions History State (stamped with owner userId) ---
  const [mockInterviewsState, setMockInterviewsState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("interview_mock_sessions", userId, INITIAL_MOCK_SESSIONS),
  }));

  // --- Rehydrate when active user ID changes ---
  useEffect(() => {
    setCompletedState({ userId, data: storageService.getInitialScopedData("interview_completed_ids", userId, []) });
    setBookmarkedState({ userId, data: storageService.getInitialScopedData("interview_bookmarked_ids", userId, []) });
    setRevisionNotesState({ userId, data: storageService.getInitialScopedData("interview_revision_notes", userId, INITIAL_REVISION_NOTES) });
    setMockInterviewsState({ userId, data: storageService.getInitialScopedData("interview_mock_sessions", userId, INITIAL_MOCK_SESSIONS) });
  }, [userId]);

  // --- Sync state to user-scoped local storage ONLY when state matches active user ---
  useEffect(() => {
    if (completedState.userId !== userId) return;
    const key = storageService.getUserKey("interview_completed_ids", userId);
    storageService.set(key, JSON.stringify(completedState.data));
  }, [completedState, userId]);

  useEffect(() => {
    if (bookmarkedState.userId !== userId) return;
    const key = storageService.getUserKey("interview_bookmarked_ids", userId);
    storageService.set(key, JSON.stringify(bookmarkedState.data));
  }, [bookmarkedState, userId]);

  useEffect(() => {
    if (revisionNotesState.userId !== userId) return;
    const key = storageService.getUserKey("interview_revision_notes", userId);
    storageService.set(key, typeof revisionNotesState.data === "string" ? revisionNotesState.data : JSON.stringify(revisionNotesState.data));
  }, [revisionNotesState, userId]);

  useEffect(() => {
    if (mockInterviewsState.userId !== userId) return;
    const key = storageService.getUserKey("interview_mock_sessions", userId);
    storageService.set(key, JSON.stringify(mockInterviewsState.data));
  }, [mockInterviewsState, userId]);

  const completedQuestions = completedState.userId === userId ? completedState.data : [];
  const bookmarkedQuestions = bookmarkedState.userId === userId ? bookmarkedState.data : [];
  const revisionNotes = revisionNotesState.userId === userId ? revisionNotesState.data : INITIAL_REVISION_NOTES;
  const mockInterviews = mockInterviewsState.userId === userId ? mockInterviewsState.data : INITIAL_MOCK_SESSIONS;

  // --- Actions ---
  const toggleBookmark = (id) => {
    setBookmarkedState((prev) => {
      const list = Array.isArray(prev?.data) ? prev.data : [];
      return {
        userId,
        data: list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
      };
    });
  };

  const toggleCompleted = (id) => {
    setCompletedState((prev) => {
      const list = Array.isArray(prev?.data) ? prev.data : [];
      return {
        userId,
        data: list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
      };
    });
  };

  const saveRevisionNotes = (notes) => {
    setRevisionNotesState({
      userId,
      data: notes || "",
    });
  };

  const addMockSession = (score, category, feedback) => {
    const newSession = {
      id: Date.now(),
      score,
      category,
      feedback,
      date: new Date().toISOString().split("T")[0],
    };
    setMockInterviewsState((prev) => ({
      userId,
      data: [newSession, ...(Array.isArray(prev?.data) ? prev.data : [])],
    }));
  };

  const value = {
    completedQuestions: Array.isArray(completedQuestions) ? completedQuestions : [],
    toggleCompleted,
    bookmarkedQuestions: Array.isArray(bookmarkedQuestions) ? bookmarkedQuestions : [],
    toggleBookmark,
    revisionNotes,
    saveRevisionNotes,
    mockInterviews: Array.isArray(mockInterviews) ? mockInterviews : INITIAL_MOCK_SESSIONS,
    addMockSession,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export default InterviewProvider;
