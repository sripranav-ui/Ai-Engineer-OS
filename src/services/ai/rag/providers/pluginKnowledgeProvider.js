/**
 * @file pluginKnowledgeProvider.js
 * @description Provider adapter searching third-party plugin knowledge extensions.
 */

import BaseRAGProvider from "./baseRAGProvider.js";

export class PluginKnowledgeProvider extends BaseRAGProvider {
  constructor() {
    super({ id: "plugin_knowledge", name: "Plugin Extension Knowledge Provider" });
  }

  async search(query, options = {}) {
    return [];
  }
}

export default PluginKnowledgeProvider;
