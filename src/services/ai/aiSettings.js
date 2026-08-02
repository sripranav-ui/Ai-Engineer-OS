// =======================================================
// aiSettings.js — Centralized AI Engine Configuration
// =======================================================
// Manages AI Provider selections, model parameters, feature
// toggles, and system prompt defaults. Persists to storage.
// =======================================================

import storageService from "../storageService";

export const DEFAULT_AI_SETTINGS = {
  provider:            "openai",        // "openai" | "gemini" | "claude" | "groq" | "openrouter" | "ollama" | "deepseek"
  model:               "gpt-4o",
  temperature:         0.7,
  maxTokens:           2048,
  systemPrompt:        "You are AI Engineer OS, an elite AI mentor, technical architect, and career coach.",
  enableMemory:        true,
  enableStreaming:     true,
  enableTools:         true,
  enableAutoContext:   true,
  apiKeys: {
    openai:     "",
    gemini:     "",
    claude:     "",
    groq:       "",
    openrouter: "",
    deepseek:   "",
  },
};

const STORAGE_KEY = "ai_engine_settings";

export const aiSettingsService = {
  /** Get current AI settings merged with defaults */
  getSettings: () => {
    try {
      const saved = storageService.get(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_AI_SETTINGS, ...parsed, apiKeys: { ...DEFAULT_AI_SETTINGS.apiKeys, ...(parsed.apiKeys || {}) } };
      }
    } catch {
      // Return defaults on error
    }
    return DEFAULT_AI_SETTINGS;
  },

  /** Update AI settings partially or fully */
  updateSettings: (partial) => {
    const current = aiSettingsService.getSettings();
    const next = { ...current, ...partial, apiKeys: { ...current.apiKeys, ...(partial.apiKeys || {}) } };
    storageService.set(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  /** Set API Key for a specific provider safely */
  setApiKey: (providerId, key) => {
    const current = aiSettingsService.getSettings();
    const updatedKeys = { ...current.apiKeys, [providerId]: key };
    return aiSettingsService.updateSettings({ apiKeys: updatedKeys });
  },

  /** Reset settings to defaults */
  reset: () => {
    storageService.set(STORAGE_KEY, JSON.stringify(DEFAULT_AI_SETTINGS));
    return DEFAULT_AI_SETTINGS;
  },
};

export default aiSettingsService;
