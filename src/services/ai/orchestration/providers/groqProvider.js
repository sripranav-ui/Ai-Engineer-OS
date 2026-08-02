// =======================================================
// groqProvider.js — Groq Ultra-Fast Llama Adapter
// =======================================================

import BaseProvider from "./baseProvider";

export class GroqProvider extends BaseProvider {
  constructor() {
    super({
      id: "groq",
      name: "Groq Ultra-Fast Core",
      supportedModels: ["llama3-70b-groq", "mixtral-8x7b-groq"],
    });
  }

  async call(prompt, options = {}) {
    return `[Groq 500tok/s Output (${options.model || "llama3-70b-groq"})]: ${prompt}`;
  }
}

export default GroqProvider;
