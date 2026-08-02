// =======================================================
// aiInterviewCoach.js — Real-Time AI Interview Evaluator
// =======================================================
// Connects to Phase 5 AI Engine to grade candidate STAR & technical
// responses, output numerical score (0-100), and provide feedback.
// =======================================================

import aiEngine from "../ai/aiEngine";

export const aiInterviewCoach = {
  /** Evaluate candidate answer to interview question */
  evaluateResponse: async ({ questionTitle, userResponse, category = "Behavioral" }, onChunk) => {
    const promptText = `You are a Senior AI Recruiter & Tech Lead interviewing a candidate for an AI Engineering role.

Question: "${questionTitle}"
Category: ${category}

Candidate Response:
"${userResponse}"

Please evaluate this answer.
Provide:
1. Numerical Score (0-100)
2. Breakdown: Situation/Task, Action, Result & Impact
3. Strengths
4. Weaknesses & Missing Details
5. 1 Suggested Follow-up Question`;

    return await aiEngine.sendMessage({
      userQuery: promptText,
      roleId: "career",
      onChunk,
    });
  },
};

export default aiInterviewCoach;
