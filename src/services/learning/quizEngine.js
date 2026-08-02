// =======================================================
// quizEngine.js — Multi-Format Quiz Engine
// =======================================================
// Supports Multiple Choice, Multiple Select, True/False,
// Fill in the blanks, Code questions, Scenario questions,
// timed quizzes, instant feedback, review mode & score history.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

const QUIZ_HISTORY_KEY = "learning_quiz_history";

export const SAMPLE_QUIZZES = {
  day1: {
    id: "quiz_day1",
    title: "Day 1: NumPy & Matrix Basics Quiz",
    timeLimitSeconds: 300,
    questions: [
      {
        id: "q1",
        type: "single",
        question: "Which NumPy function creates a 2D array filled with zeros?",
        options: ["np.empty((2,2))", "np.zeros((2,2))", "np.ones((2,2))", "np.fill((2,2), 0)"],
        correctAnswer: 1,
        explanation: "np.zeros((shape)) allocates and initializes an array with zeroes.",
      },
      {
        id: "q2",
        type: "boolean",
        question: "Broadcasting allows NumPy to perform arithmetic operations on arrays of different shapes.",
        options: ["True", "False"],
        correctAnswer: 0,
        explanation: "True. Broadcasting expands smaller arrays across compatible dimensions.",
      },
      {
        id: "q3",
        type: "code",
        question: "Fill in the missing method to compute vector dot product: `np.____(a, b)`",
        options: ["dot", "multiply", "sum", "matmul"],
        correctAnswer: 0,
        explanation: "np.dot(a, b) calculates inner dot product of two 1D vectors.",
      },
    ],
  },
};

export const quizEngine = {
  /** Get quiz by ID */
  getQuiz: (quizId = "quiz_day1") => {
    return SAMPLE_QUIZZES[quizId] || SAMPLE_QUIZZES.day1;
  },

  /** Evaluate submitted quiz answers */
  evaluateQuiz: (quizId, userAnswers = {}) => {
    const quiz = quizEngine.getQuiz(quizId);
    let score = 0;
    const total = quiz.questions.length;
    const results = [];

    quiz.questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) score++;

      results.push({
        questionId: q.id,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const pct = Math.round((score / total) * 100);
    const attempt = {
      quizId,
      quizTitle: quiz.title,
      score,
      total,
      pct,
      timestamp: new Date().toISOString(),
      results,
    };

    // Save attempt to history
    quizEngine.saveAttempt(attempt);
    return attempt;
  },

  /** Save attempt to score history */
  saveAttempt: (attempt) => {
    try {
      const raw = storageService.get(QUIZ_HISTORY_KEY);
      const history = raw ? JSON.parse(raw) : [];
      history.unshift(attempt);
      storageService.set(QUIZ_HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      logger.error("[QuizEngine] Error saving quiz attempt:", err);
    }
  },

  /** Get attempt history */
  getHistory: () => {
    try {
      const raw = storageService.get(QUIZ_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};

export default quizEngine;
