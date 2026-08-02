// =======================================================
// openAIProvider.js — OpenAI Model Adapter
// =======================================================

import BaseProvider from "./baseProvider";

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super({
      id: "openai",
      name: "OpenAI Models Core",
      supportedModels: ["gpt-4o", "gpt-4-turbo"],
    });
  }

  async call(prompt, options = {}) {
    return `[OpenAI Output (${options.model || "gpt-4o"})]: ${prompt}`;
  }
}

export default OpenAIProvider;
