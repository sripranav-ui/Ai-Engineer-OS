// =======================================================
// fallbackManager.js — Fallback Provider Chain Switcher
// =======================================================

import providerRegistry from "../registry/providerRegistry";
import logger from "../../../../utils/logger";

const FALLBACK_CHAIN = ["openai", "claude", "groq", "ollama"];

export const fallbackManager = {
  /**
   * Execute call with automatic fallback chain on provider failure
   */
  executeWithFallback: async (primaryProviderId, prompt, options = {}) => {
    const chain = [primaryProviderId, ...FALLBACK_CHAIN.filter((p) => p !== primaryProviderId)];

    for (const providerId of chain) {
      const provider = providerRegistry.getProvider(providerId);
      if (!provider) continue;

      try {
        logger.info(`[FallbackManager] Attempting call with provider "${provider.name}" (${providerId})...`);
        const result = await provider.call(prompt, options);
        return { result, providerId, fallbackOccurred: providerId !== primaryProviderId };
      } catch (err) {
        logger.warn(`[FallbackManager] Provider "${providerId}" failed. Swapping to next fallback in chain...`, err);
      }
    }

    throw new Error("All fallback AI providers in the chain failed to execute request.");
  },
};

export default fallbackManager;
