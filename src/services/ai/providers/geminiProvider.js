// =======================================================
// geminiProvider.js — Google Gemini API Integration
// =======================================================

import { BaseProvider } from "./baseProvider.js";
import logger from "../../../utils/logger.js";

export class GeminiProvider extends BaseProvider {
  constructor() {
    super("gemini", "Google Gemini");
  }

  listModels() {
    return [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Google's flagship complex reasoning model" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "High-speed multimodal flash model" },
    ];
  }

  async validateKey(keyToTest) {
    const key = keyToTest || this.apiKey;
    if (!key || !key.trim()) {
      return { success: false, error: "Missing Gemini API Key" };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`
      );

      if (response.ok) {
        return { success: true, message: "Connected to Google Gemini API successfully." };
      } else if (response.status === 400 || response.status === 403) {
        return { success: false, error: "Invalid Gemini API Key or permission denied." };
      } else {
        return { success: false, error: `Gemini API returned HTTP ${response.status}.` };
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
    const model = options.model || this.selectedModel || "gemini-2.5-flash";

    if (!key || !key.trim()) {
      return {
        text: "⚠️ **Missing Gemini API Key**\n\nPlease enter and save your Google Gemini API key in **Settings → AI Providers**.",
        error: "Missing Key",
      };
    }

    try {
      const contents = messages.map((m) => ({
        role: (m.role || m.sender) === "assistant" ? "model" : "user",
        parts: [{ text: m.content || m.text || "" }],
      }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 403) {
          return { text: "⚠️ **Invalid Gemini API Key (403)**", error: "403 Forbidden" };
        }
        if (response.status === 429) {
          return { text: "⚠️ **Gemini Rate Limit Exceeded (429)**", error: "429 Rate Limit" };
        }
        return { text: `⚠️ **Gemini API Error (HTTP ${response.status})**`, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";

      return { text: replyText, model };
    } catch (err) {
      logger.error("[GeminiProvider] Error generating response:", err);
      return { text: `⚠️ **Gemini Connection Error**: ${err.message}`, error: err.message };
    }
  }

  async streamMessage(messages = [], options = {}, onChunk = () => {}) {
    const key = options.apiKey || this.apiKey;
    const model = options.model || this.selectedModel || "gemini-2.5-flash";

    if (!key || !key.trim()) {
      const fallback = await this.sendMessage(messages, options);
      onChunk(fallback.text);
      return fallback;
    }

    try {
      const contents = messages.map((m) => ({
        role: (m.role || m.sender) === "assistant" ? "model" : "user",
        parts: [{ text: m.content || m.text || "" }],
      }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${key.trim()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: options.signal,
        body: JSON.stringify({ contents }),
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
        
        // Parse JSON SSE fragments from Gemini stream
        try {
          const lines = chunkStr.split("\n").filter((l) => l.trim().startsWith("[") || l.trim().startsWith("{"));
          for (const line of lines) {
            const parsed = JSON.parse(line.replace(/^,/, ""));
            const textPart = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || parsed?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textPart) {
              fullText += textPart;
              onChunk(fullText);
            }
          }
        } catch {
          // If raw chunk fragment, append text directly if present
          if (chunkStr) {
            fullText += chunkStr;
            onChunk(fullText);
          }
        }
      }

      return { text: fullText || "No stream content received.", model };
    } catch (err) {
      if (err.name === "AbortError") {
        return { text: "🛑 **Generation Cancelled**", cancelled: true };
      }
      return await this.sendMessage(messages, options);
    }
  }
}

export const geminiProvider = new GeminiProvider();
export default geminiProvider;
