// =======================================================
// ollamaProvider.js — Local Ollama LLM Integration
// =======================================================

import { BaseProvider } from "./baseProvider.js";
import logger from "../../../utils/logger.js";

export class OllamaProvider extends BaseProvider {
  constructor() {
    super("ollama", "Ollama (Local)");
    this.baseUrl = "http://localhost:11434";
  }

  initialize(config = {}) {
    super.initialize(config);
    this.baseUrl = config.baseUrl || "http://localhost:11434";
  }

  listModels() {
    return [
      { id: "llama3", name: "llama3", description: "Meta Llama 3 open weights model" },
      { id: "mistral", name: "mistral", description: "Mistral AI 7B open model" },
      { id: "qwen2.5", name: "qwen2.5", description: "Alibaba Qwen 2.5 model" },
    ];
  }

  async validateKey(urlToTest) {
    const targetUrl = (urlToTest || this.baseUrl || "http://localhost:11434").replace(/\/$/, "");

    try {
      const response = await fetch(`${targetUrl}/api/tags`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        const modelsCount = data?.models?.length || 0;
        return {
          success: true,
          message: `Connected to Ollama at ${targetUrl} successfully. (${modelsCount} model(s) installed).`,
        };
      } else {
        return { success: false, error: `Ollama returned HTTP ${response.status} at ${targetUrl}.` };
      }
    } catch (err) {
      return {
        success: false,
        error: `Ollama server is unavailable at ${targetUrl}. Ensure Ollama is running locally.`,
      };
    }
  }

  async sendMessage(messages = [], options = {}) {
    const baseUrl = (options.baseUrl || this.baseUrl || "http://localhost:11434").replace(/\/$/, "");
    const model = options.model || this.selectedModel || "llama3";

    try {
      const formattedMessages = messages.map((m) => ({
        role: (m.role || m.sender) === "assistant" ? "assistant" : "user",
        content: m.content || m.text || "",
      }));

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        return {
          text: `⚠️ **Ollama Error (HTTP ${response.status})**\n\nEnsure model "${model}" is pulled in Ollama (\`ollama pull ${model}\`).`,
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const replyText = data?.message?.content || "No response received from local Ollama model.";

      return { text: replyText, model };
    } catch (err) {
      logger.error("[OllamaProvider] Error generating response:", err);
      return {
        text: `⚠️ **Ollama Connection Failed**\n\nCould not connect to Ollama at \`${baseUrl}\`. Please verify Ollama is running on your machine.`,
        error: err.message,
      };
    }
  }

  async streamMessage(messages = [], options = {}, onChunk = () => {}) {
    const baseUrl = (options.baseUrl || this.baseUrl || "http://localhost:11434").replace(/\/$/, "");
    const model = options.model || this.selectedModel || "llama3";

    try {
      const formattedMessages = messages.map((m) => ({
        role: (m.role || m.sender) === "assistant" ? "assistant" : "user",
        content: m.content || m.text || "",
      }));

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: options.signal,
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        return await this.sendMessage(messages, options);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const part = parsed?.message?.content;
            if (part) {
              fullText += part;
              onChunk(fullText);
            }
          } catch {
            // Ignore partial lines
          }
        }
      }

      return { text: fullText || "No response from Ollama stream.", model };
    } catch (err) {
      if (err.name === "AbortError") {
        return { text: "🛑 **Generation Cancelled**", cancelled: true };
      }
      return await this.sendMessage(messages, options);
    }
  }
}

export const ollamaProvider = new OllamaProvider();
export default ollamaProvider;
