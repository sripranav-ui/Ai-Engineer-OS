import React, { createContext, useState, useEffect } from "react";

// =======================================================
// InterviewContext.jsx
// Global context for Interview Preparation logs & mock history
// Guarded state initialization for zero render crashes
// =======================================================

export const InterviewContext = createContext();

const INITIAL_MOCK_SESSIONS = [
  { id: 1, score: 85, category: "Core ML & Python", feedback: "Strong coding logic and Python details, but review backprop mathematics.", date: "2026-07-16" }
];

export function InterviewProvider({ children }) {
  // --- 1. Completed Questions ---
  const [completedQuestions, setCompletedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem("interview_completed_ids");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("interview_completed_ids", JSON.stringify(completedQuestions));
  }, [completedQuestions]);

  // --- 2. Bookmarked Questions ---
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem("interview_bookmarked_ids");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("interview_bookmarked_ids", JSON.stringify(bookmarkedQuestions));
  }, [bookmarkedQuestions]);

  // --- 3. Revision Notes ---
  const [revisionNotes, setRevisionNotes] = useState(() => {
    const saved = localStorage.getItem("interview_revision_notes");
    return saved || "## My Interview Cheat-sheet\nWrite Python built-ins, complex space-times, ML equations, and behavioral notes here.";
  });

  useEffect(() => {
    localStorage.setItem("interview_revision_notes", revisionNotes);
  }, [revisionNotes]);

  // --- 4. Mock Sessions History ---
  const [mockInterviews, setMockInterviews] = useState(() => {
    try {
      const saved = localStorage.getItem("interview_mock_sessions");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MOCK_SESSIONS;
    } catch {
      return INITIAL_MOCK_SESSIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem("interview_mock_sessions", JSON.stringify(mockInterviews));
  }, [mockInterviews]);

  // --- Actions ---
  const toggleBookmark = (id) => {
    setBookmarkedQuestions((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    });
  };

  const toggleCompleted = (id) => {
    setCompletedQuestions((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    });
  };

  const saveRevisionNotes = (notes) => {
    setRevisionNotes(notes || "");
  };

  const addMockSession = (score, category, feedback) => {
    const newSession = {
      id: Date.now(),
      score,
      category,
      feedback,
      date: new Date().toISOString().split("T")[0],
    };
    setMockInterviews((prev) => [newSession, ...(Array.isArray(prev) ? prev : [])]);
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
