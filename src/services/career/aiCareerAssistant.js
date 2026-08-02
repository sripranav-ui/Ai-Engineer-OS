// =======================================================
// aiCareerAssistant.js — AI Career Assistant Integration
// =======================================================
// Connects Career Engine to Phase 5 AI Engine to generate
// cover letters, optimize LinkedIn summaries, and rewrite resume bullets.
// =======================================================

import aiEngine from "../ai/aiEngine";

export const aiCareerAssistant = {
  /** Generate tailored cover letter */
  generateCoverLetter: async ({ companyName, roleTitle, userSkills }, onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Write a compelling, professional cover letter for the role of "${roleTitle}" at "${companyName}". Key skills: ${userSkills.join(", ")}.`,
      roleId: "career",
      onChunk,
    });
  },

  /** Optimize LinkedIn Headline & About Summary */
  optimizeLinkedIn: async ({ currentRole, targetRole, topSkills }, onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Generate an eye-catching LinkedIn Headline and 3-paragraph "About" summary for an ambitious software engineer transitioning from "${currentRole}" to "${targetRole}". Top skills: ${topSkills.join(", ")}.`,
      roleId: "career",
      onChunk,
    });
  },

  /** Rewrite resume bullet point using STAR impact metrics */
  rewriteResumeBullet: async (bulletText, onChunk) => {
    return await aiEngine.sendMessage({
      userQuery: `Rewrite this resume bullet point into a high-impact STAR metric bullet (Action verb + Context + Quantifiable Result):\n\n"${bulletText}"`,
      roleId: "career",
      onChunk,
    });
  },
};

export default aiCareerAssistant;
