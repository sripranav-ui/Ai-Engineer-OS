// =======================================================
// baseProvider.js — Common Base AI Provider Abstract Interface
// =======================================================

export class BaseProvider {
  constructor(name, displayName) {
    this.name = name;
    this.displayName = displayName;
    this.enabled = false;
    this.apiKey = "";
    this.selectedModel = "";
  }

  /** Initialize provider with saved configuration */
  initialize(config = {}) {
    this.enabled = !!config.enabled;
    this.apiKey = config.apiKey || "";
    this.selectedModel = config.selectedModel || this.getDefaultModel();
  }

  /** Get default model ID for provider */
  getDefaultModel() {
    const models = this.listModels();
    return models.length > 0 ? models[0].id : "";
  }

  /** Synchronous / Async message completion interface */
  async sendMessage(messages, options = {}) {
    throw new Error(`sendMessage() is not implemented on provider "${this.name}".`);
  }

  /** Stream message completion interface (Phase 2 compatibility) */
  async streamMessage(messages, options = {}, onChunk = () => {}) {
    throw new Error(`streamMessage() is not implemented on provider "${this.name}".`);
  }

  /** Return supported models array */
  listModels() {
    return [];
  }

  /** Validate API key by testing connectivity */
  async validateKey(apiKey) {
    throw new Error(`validateKey() is not implemented on provider "${this.name}".`);
  }
}

export default BaseProvider;
