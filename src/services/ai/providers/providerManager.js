import storageAdapter from "../memory/storage/storageAdapter.js";
import { openaiProvider } from "./openaiProvider.js";
import { geminiProvider } from "./geminiProvider.js";
import { anthropicProvider } from "./anthropicProvider.js";
import { ollamaProvider } from "./ollamaProvider.js";
import ragManager from "../rag/ragManager.js";
import logger from "../../../utils/logger.js";

const PROVIDER_CONFIG_KEY = "ai_provider_configs_v1";
const ACTIVE_PROVIDER_KEY = "ai_active_provider_v1";

class ProviderManager {
  constructor() {
    this.providers = new Map();
    this.activeProviderName = "openai";

    // Register all supported providers
    this.registerProvider(openaiProvider);
    this.registerProvider(geminiProvider);
    this.registerProvider(anthropicProvider);
    this.registerProvider(ollamaProvider);

    this.loadState();
  }

  /** Register provider instance */
  registerProvider(providerInstance) {
    if (!providerInstance || !providerInstance.name) {
      throw new Error("Invalid provider instance");
    }
    this.providers.set(providerInstance.name, providerInstance);
  }

  /** Load provider configs from storage */
  loadState() {
    const savedActive = storageAdapter.get(ACTIVE_PROVIDER_KEY, "openai");
    this.activeProviderName = savedActive;

    const configs = storageAdapter.get(PROVIDER_CONFIG_KEY, {});

    this.providers.forEach((provider, name) => {
      const config = configs[name] || {};
      provider.initialize(config);
    });
  }

  /** Get active provider instance */
  getActiveProvider() {
    return this.providers.get(this.activeProviderName) || this.providers.get("openai");
  }

  /** Get provider by name */
  getProvider(name) {
    return this.providers.get(name) || null;
  }

  /** Get active provider name */
  getActiveProviderName() {
    return this.activeProviderName;
  }

  /** Set active provider */
  setActiveProvider(name) {
    if (this.providers.has(name)) {
      this.activeProviderName = name;
      storageAdapter.set(ACTIVE_PROVIDER_KEY, name);
      logger.info(`[ProviderManager] Active provider set to: "${name}"`);
    }
  }

  /** Get configuration object for provider */
  getProviderConfig(name) {
    const provider = this.getProvider(name);
    if (!provider) return null;
    return {
      enabled: provider.enabled,
      apiKey: provider.apiKey,
      selectedModel: provider.selectedModel,
      baseUrl: provider.baseUrl || "http://localhost:11434",
    };
  }

  /** Save configuration object for provider */
  saveProviderConfig(name, config = {}) {
    const provider = this.getProvider(name);
    if (!provider) return;

    provider.initialize(config);

    const allConfigs = storageAdapter.get(PROVIDER_CONFIG_KEY, {});
    allConfigs[name] = {
      enabled: provider.enabled,
      apiKey: provider.apiKey,
      selectedModel: provider.selectedModel,
      baseUrl: config.baseUrl || provider.baseUrl || "http://localhost:11434",
    };

    storageAdapter.set(PROVIDER_CONFIG_KEY, allConfigs);
    logger.info(`[ProviderManager] Saved config for provider "${name}".`);
  }

  /** List all registered providers metadata */
  listProviders() {
    const list = [];
    this.providers.forEach((p) => {
      list.push({
        name: p.name,
        displayName: p.displayName,
        enabled: p.enabled,
        selectedModel: p.selectedModel,
        models: p.listModels(),
      });
    });
    return list;
  }

  /** Test & validate API key for provider */
  async validateKey(name, apiKey) {
    const provider = this.getProvider(name);
    if (!provider) return { success: false, error: "Provider not found" };
    return await provider.validateKey(apiKey);
  }

  /** Helper to augment prompt messages with RAG context if enabled */
  async augmentWithRagContext(messages = [], options = {}) {
    if (options.useKnowledgeBase === false) return messages;

    try {
      let queryText = "";
      if (typeof messages === "string") {
        queryText = messages;
      } else if (Array.isArray(messages) && messages.length > 0) {
        const lastUser = [...messages].reverse().find((m) => m.role === "user" || !m.role);
        queryText = lastUser ? (typeof lastUser === "string" ? lastUser : lastUser.content) : "";
      }

      if (!queryText || !queryText.trim()) return messages;

      const ragResult = await ragManager.retrieveContext(queryText, options);
      // Smooth Fallback: If zero relevant chunks found above threshold, return original messages unchanged
      if (!ragResult || !ragResult.formattedContext) return messages;

      const ragContextPayload = `\n\n--- RELEVANT KNOWLEDGE BASE CONTEXT (RAG) ---\n${ragResult.formattedContext}\n--- END KNOWLEDGE BASE CONTEXT ---`;

      if (typeof messages === "string") {
        return `${messages}${ragContextPayload}`;
      }

      if (Array.isArray(messages)) {
        return messages.map((msg, idx) => {
          if (idx === messages.length - 1 && (msg.role === "user" || !msg.role)) {
            return {
              ...msg,
              content: `${msg.content}${ragContextPayload}`,
            };
          }
          return msg;
        });
      }

      return messages;
    } catch (err) {
      logger.warn("[ProviderManager] RAG Context Augmentation failed, falling back to direct prompt:", err);
      return messages;
    }
  }

  /** Delegate message generation to specified conversation provider or active provider */
  async sendMessage(messages = [], options = {}) {
    const targetProviderName = options.provider || this.activeProviderName;
    const provider = this.getProvider(targetProviderName) || this.getActiveProvider();

    if (!provider) {
      return {
        text: "⚠️ **No AI Provider Available**\n\nPlease select an active provider in Settings → AI Providers.",
        error: "No Provider",
      };
    }

    const augmentedMessages = await this.augmentWithRagContext(messages, options);
    return await provider.sendMessage(augmentedMessages, options);
  }

  /** Stream message tokens from specified provider or active provider */
  async streamMessage(messages = [], options = {}, onChunk = () => {}) {
    const targetProviderName = options.provider || this.activeProviderName;
    const provider = this.getProvider(targetProviderName) || this.getActiveProvider();

    if (!provider) {
      const fallbackText = "⚠️ **No AI Provider Available**\n\nPlease select an active provider in Settings → AI Providers.";
      onChunk(fallbackText);
      return { text: fallbackText, error: "No Provider" };
    }

    const augmentedMessages = await this.augmentWithRagContext(messages, options);
    return await provider.streamMessage(augmentedMessages, options, onChunk);
  }
}

export const providerManager = new ProviderManager();
export default providerManager;
