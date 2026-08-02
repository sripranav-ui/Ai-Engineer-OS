// =======================================================
// baseProvider.js — Abstract Base Provider Class
// =======================================================

export class BaseProvider {
  constructor({ id, name, supportedModels = [] }) {
    if (!id || !name) {
      throw new Error("Provider construction requires 'id' and 'name'.");
    }
    this.id = id;
    this.name = name;
    this.supportedModels = supportedModels;
  }

  async call(prompt, options = {}) {
    throw new Error(`call() not implemented for provider "${this.id}".`);
  }

  async streamCall(prompt, options = {}, onChunk) {
    throw new Error(`streamCall() not implemented for provider "${this.id}".`);
  }
}

export default BaseProvider;
