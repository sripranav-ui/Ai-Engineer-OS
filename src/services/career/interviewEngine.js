// =======================================================
// interviewEngine.js — Interview Preparation & Question Bank
// =======================================================
// Manages question bank, categories (Behavioral STAR, Technical,
// System Design, Coding), score history, and completed status.
// =======================================================

import storageService from "../storageService";

const INTERVIEW_SESSIONS_KEY = "career_interview_sessions";

export const INTERVIEW_QUESTIONS = [
  {
    id: "q_star_1",
    category: "Behavioral",
    title: "Tell me about a time you resolved a difficult technical disagreement on model architecture.",
    difficulty: "Medium",
    framework: "STAR Method (Situation, Task, Action, Result)",
  },
  {
    id: "q_tech_1",
    category: "Technical ML",
    title: "Explain how Vanishing Gradients occur in deep networks and how Residual Connections (ResNets) solve it.",
    difficulty: "Hard",
    framework: "Technical Deep Dive",
  },
  {
    id: "q_sys_1",
    category: "System Design",
    title: "Design an Enterprise Vector Search Engine capable of querying 100M 1536-dim embeddings with <50ms latency.",
    difficulty: "Hard",
    framework: "System Architecture & Scalability",
  },
];

export const interviewEngine = {
  /** Get all interview questions */
  getQuestionBank: () => INTERVIEW_QUESTIONS,

  /** Get past mock interview attempts */
  getMockHistory: () => {
    try {
      const raw = storageService.get(INTERVIEW_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [
        { id: "mock_1", category: "Technical ML", score: 88, date: "2026-07-20", feedback: "Excellent explanation of gradient descent and autograd. Work on ResNet formulas." },
      ];
    } catch {
      return [];
    }
  },

  /** Save mock interview attempt result */
  saveMockAttempt: (attemptData) => {
    const history = interviewEngine.getMockHistory();
    const newAttempt = {
      id: `mock_${Date.now()}`,
      category: attemptData.category || "Technical ML",
      score: attemptData.score || 85,
      feedback: attemptData.feedback || "Good response.",
      date: new Date().toISOString().split("T")[0],
    };
    const updated = [newAttempt, ...history];
    storageService.set(INTERVIEW_SESSIONS_KEY, JSON.stringify(updated));
    return newAttempt;
  },
};

export default interviewEngine;
