// =======================================================
// anthropicProvider.js — Anthropic Claude API Integration
// =======================================================

import { BaseProvider } from "./baseProvider.js";
import logger from "../../../utils/logger.js";

export class AnthropicProvider extends BaseProvider {
  constructor() {
    super("anthropic", "Anthropic Claude");
  }

  listModels() {
    return [
      { id: "claude-3-7-sonnet", name: "Claude Sonnet", description: "Anthropic's flagship intelligent model" },
      { id: "claude-3-opus", name: "Claude Opus", description: "Deep reasoning & writing model" },
    ];
  }

  async validateKey(keyToTest) {
    const key = keyToTest || this.apiKey;
    if (!key || !key.trim()) {
      return { success: false, error: "Missing Anthropic API Key" };
    }

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key.trim(),
          "anthropic-version": "2023-06-01",
          "dangerously-allow-browser": "true",
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet",
          max_tokens: 1,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });

      if (response.ok || response.status === 200) {
        return { success: true, message: "Connected to Anthropic API successfully." };
      } else if (response.status === 401) {
        return { success: false, error: "Invalid Anthropic API Key (401 Unauthorized)." };
      } else if (response.status === 429) {
        return { success: false, error: "Rate limit exceeded (429 Too Many Requests)." };
      } else {
        return { success: false, error: `Anthropic API returned HTTP ${response.status}.` };
      }
    } catch (err) {
      if (!navigator.onLine) {
        return { success: false, error: "Network offline. Check your internet connection." };
      }
      return { success: false, error: `Connection failed: ${err.message}` };
    }
  }

  async sendMessage(messages = [], options = {}) {
    const key = options.apiKey || this.apiKey;
    const model = options.model || this.selectedModel || "claude-3-7-sonnet";

    if (!key || !key.trim()) {
      return {
        text: "⚠️ **Missing Anthropic API Key**\n\nPlease enter and save your Anthropic API key in **Settings → AI Providers**.",
        error: "Missing Key",
      };
    }

    try {
      const formattedMessages = messages.map((m) => ({
        role: (m.role || m.sender) === "assistant" ? "assistant" : "user",
        content: m.content || m.text || "",
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key.trim(),
          "anthropic-version": "2023-06-01",
          "dangerously-allow-browser": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: options.maxTokens || 4096,
          messages: formattedMessages,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { text: "⚠️ **Invalid Anthropic API Key (401)**", error: "401 Unauthorized" };
        }
        if (response.status === 429) {
          return { text: "⚠️ **Anthropic Rate Limit Exceeded (429)**", error: "429 Rate Limit" };
        }
        return { text: `⚠️ **Anthropic Error (HTTP ${response.status})**`, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      const replyText = data?.content?.[0]?.text || "No response received from Claude.";

      return { text: replyText, model, usage: data.usage };
    } catch (err) {
      logger.error("[AnthropicProvider] Error generating response:", err);
      return { text: `⚠️ **Claude Connection Error**: ${err.message}`, error: err.message };
    }
  }

  async streamMessage(messages = [], options = {}, onChunk = () => {}) {
    // Basic streaming fallback using sendMessage for browser safety
    const res = await this.sendMessage(messages, options);
    if (res && res.text) {
      onChunk(res.text);
    }
    return res;
  }
}

export const anthropicProvider = new AnthropicProvider();
export default anthropicProvider;
