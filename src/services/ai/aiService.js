import providers from "./providers";
import promptService from "./promptService";
import conversationService from "./conversationService";
import tokenCounter from "./tokenCounter";
import costCalculator from "./costCalculator";

/**
 * Enterprise Orchestrated AIService Client Wrapper
 */
export const aiService = {
  /**
   * Generates AI responses routing calls to active provider策略
   */
  generate: async (providerId, prompt, systemContext = "") => {
    const handler = providers[providerId];
    if (!handler) {
      throw new Error(`AI Provider strategy "${providerId}" is not registered.`);
    }

    // Compile templates if necessary
    return handler.call(prompt, systemContext);
  },

  // Expose submodule instances for architectural completeness
  prompts: promptService,
  conversations: conversationService,
  tokens: tokenCounter,
  costs: costCalculator
};

export default aiService;
