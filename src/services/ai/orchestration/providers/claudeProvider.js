// =======================================================
// claudeProvider.js — Anthropic Claude Model Adapter
// =======================================================

import BaseProvider from "./baseProvider";

export class ClaudeProvider extends BaseProvider {
  constructor() {
    super({
      id: "claude",
      name: "Anthropic Claude Core",
      supportedModels: ["claude-3-5-sonnet", "claude-3-haiku"],
    });
  }

  async call(prompt, options = {}) {
    return `[Claude Output (${options.model || "claude-3-5-sonnet"})]: ${prompt}`;
  }
}

export default ClaudeProvider;
