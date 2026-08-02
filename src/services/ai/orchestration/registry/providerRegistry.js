// =======================================================
// providerRegistry.js — Provider Registration Singleton
// =======================================================

import logger from "../../../../utils/logger";

class ProviderRegistry {
  constructor() {
    this.providersMap = new Map();
  }

  registerProvider(provider) {
    if (!provider || !provider.id) throw new Error("Invalid provider instance.");
    this.providersMap.set(provider.id, provider);
    logger.info(`[ProviderRegistry] Registered AI provider "${provider.name}" (${provider.id}).`);
  }

  getProvider(providerId) {
    return this.providersMap.get(providerId) || this.providersMap.get("openai") || null;
  }

  getAllProviders() {
    return Array.from(this.providersMap.values());
  }
}

export const providerRegistry = new ProviderRegistry();
export default providerRegistry;
