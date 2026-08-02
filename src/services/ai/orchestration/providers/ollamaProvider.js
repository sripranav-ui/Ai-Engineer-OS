// =======================================================
// ollamaProvider.js — Local Ollama / LM Studio Adapter
// =======================================================

import BaseProvider from "./baseProvider";

export class OllamaProvider extends BaseProvider {
  constructor() {
    super({
      id: "ollama",
      name: "Ollama / LM Studio (Local)",
      supportedModels: ["ollama-llama3", "mistral-local"],
    });
  }

  async call(prompt, options = {}) {
    return `[Local Offline Ollama Output (${options.model || "ollama-llama3"})]: ${prompt}`;
  }
}

export default OllamaProvider;
