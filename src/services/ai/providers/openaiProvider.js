// =======================================================
// openaiProvider.js — OpenAI Chat Completions Integration
// =======================================================

import { BaseProvider } from "./baseProvider.js";
import logger from "../../../utils/logger.js";

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super("openai", "OpenAI");
  }

  listModels() {
    return [
      { id: "gpt-5.5", name: "GPT-5.5", description: "Most capable flagship reasoning & coding model" },
      { id: "gpt-5-mini", name: "GPT-5 Mini", description: "Fast, compact high-efficiency model" },
      { id: "gpt-4.1", name: "GPT-4.1", description: "Advanced multimodal engineering model" },
      { id: "gpt-4o", name: "GPT-4o", description: "Versatile high-intelligence model" },
    ];
  }

  async validateKey(keyToTest) {
    const key = keyToTest || this.apiKey;
    if (!key || !key.trim()) {
      return { success: false, error: "Missing API Key" };
    }

    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key.trim()}`,
        },
      });

      if (response.status === 200) {
        return { success: true, message: "Connected to OpenAI API successfully." };
      } else if (response.status === 401) {
        return { success: false, error: "Invalid API key provided (401 Unauthorized)." };
      } else if (response.status === 429) {
        return { success: false, error: "Rate limit exceeded or insufficient quota (429 Too Many Requests)." };
      } else {
        return { success: false, error: `OpenAI API returned HTTP ${response.status}.` };
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
    const model = options.model || this.selectedModel || "gpt-4o";

    if (!key || !key.trim()) {
      return {
        text: "⚠️ **Missing OpenAI API Key**\n\nPlease enter and save your OpenAI API key in **Settings → AI Providers** to generate live responses.",
        error: "Missing Key",
      };
    }

    try {
      // Format messages array for OpenAI Payload
      const formattedMessages = messages.map((m) => ({
        role: m.role || m.sender || "user",
        content: m.content || m.text || "",
      }));

      if (options.systemPrompt) {
        formattedMessages.unshift({ role: "system", content: options.systemPrompt });
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: options.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            text: "⚠️ **Invalid API Key (401)**\n\nYour OpenAI API key was rejected. Please verify your key in **Settings → AI Providers**.",
            error: "401 Unauthorized",
          };
        }
        if (response.status === 429) {
          return {
            text: "⚠️ **Quota / Rate Limit Exceeded (429)**\n\nYou have exceeded your OpenAI rate limit or account quota.",
            error: "429 Rate Limit",
          };
        }
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${response.status}`;
        return {
          text: `⚠️ **OpenAI Error**: ${errMsg}`,
          error: errMsg,
        };
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "No response received from OpenAI.";

      return {
        text: reply,
        usage: data.usage,
        model: data.model,
      };
    } catch (err) {
      logger.error("[OpenAIProvider] Error generating response:", err);
      if (!navigator.onLine) {
        return {
          text: "⚠️ **Network Connection Offline**\n\nPlease check your network connection and try again.",
          error: "Offline",
        };
      }
      return {
        text: `⚠️ **Request Timeout or Connection Error**: ${err.message}`,
        error: err.message,
      };
    }
  }

  async streamMessage(messages = [], options = {}, onChunk = () => {}) {
    const key = options.apiKey || this.apiKey;
    const model = options.model || this.selectedModel || "gpt-4o";

    if (!key || !key.trim()) {
      const fallback = await this.sendMessage(messages, options);
      onChunk(fallback.text);
      return fallback;
    }

    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role || m.sender || "user",
        content: m.content || m.text || "",
      }));

      if (options.systemPrompt) {
        formattedMessages.unshift({ role: "system", content: options.systemPrompt });
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        signal: options.signal,
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: options.temperature ?? 0.7,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const fallback = await this.sendMessage(messages, options);
        onChunk(fallback.text);
        return fallback;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split("\n").filter((l) => l.trim().startsWith("data:"));

        for (const line of lines) {
          const payload = line.replace(/^data:\s*/, "").trim();
          if (payload === "[DONE]") break;

          try {
            const parsed = JSON.parse(payload);
            const token = parsed?.choices?.[0]?.delta?.content;
            if (token) {
              fullText += token;
              onChunk(fullText);
            }
          } catch {
            // Ignore partial SSE JSON frames
          }
        }
      }

      return { text: fullText || "No response received from OpenAI.", model };
    } catch (err) {
      if (err.name === "AbortError") {
        return { text: "🛑 **Generation Cancelled**", cancelled: true };
      }
      return await this.sendMessage(messages, options);
    }
  }
}

export const openaiProvider = new OpenAIProvider();
export default openaiProvider;
