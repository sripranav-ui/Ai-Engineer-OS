import aiEngine from "./ai/aiEngine";

// Backward compatibility wrapper mapping aiService calls to aiEngine
export const aiService = {
  generate: async (providerId, prompt, systemContext = "") => {
    return aiEngine.sendMessage({ userQuery: prompt, roleId: "mentor" });
  },

  engine: aiEngine,
  prompts: aiEngine.prompts,
  conversations: aiEngine.conversations,
  tools: aiEngine.tools,
  settings: aiEngine.settings,
};

export default aiService;
