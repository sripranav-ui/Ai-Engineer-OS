// =======================================================
// aiLearningHelper.js — AI Learning Integration Helper
// =======================================================
// Connects Learning Engine operations to the Phase 5 AI Engine.
// Supports:
//   - Explain topic / concept
//   - Simplify topic
//   - Generate Python code example
//   - Generate quiz question
//   - Generate flashcards
//   - Summarize study note
//   - Generate revision plan
// =======================================================

import aiEngine from "../ai/aiEngine";

export const aiLearningHelper = {
  /** Explain a complex AI topic with real-world analogies */
  explainTopic: async (topicName, onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Explain the concept of "${topicName}" with a real-world software engineering analogy and simple Python example code.`,
      roleId: "learning",
      onChunk,
    });
  },

  /** Simplify a technical concept */
  simplifyTopic: async (topicName, onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Explain "${topicName}" as if I am 5 years old. Focus on core intuition.`,
      roleId: "learning",
      onChunk,
    });
  },

  /** Generate code example for a topic */
  generateExample: async (topicName, language = "Python", onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Write a clean, production-grade ${language} example demonstrating "${topicName}". Include line comments.`,
      roleId: "coder",
      onChunk,
    });
  },

  /** Summarize a long study note */
  summarizeNote: async (noteTitle, noteContent, onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Summarize this study note titled "${noteTitle}" into 3 bullet points:\n\n${noteContent}`,
      roleId: "mentor",
      onChunk,
    });
  },

  /** Generate flashcard Q&A pair for a topic */
  generateFlashcard: async (topicName) => {
    const raw = await aiEngine.sendMessage({
      userQuery: `Create 1 high-yield flashcard for the topic "${topicName}". Return exact JSON with format: {"question": "...", "answer": "..."}`,
      roleId: "learning",
    });
    try {
      return JSON.parse(raw);
    } catch {
      return {
        question: `What is the key takeaway of ${topicName}?`,
        answer: raw.slice(0, 150),
      };
    }
  },
};

export default aiLearningHelper;
