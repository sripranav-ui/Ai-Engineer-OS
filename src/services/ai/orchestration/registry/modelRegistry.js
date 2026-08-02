// =======================================================
// modelRegistry.js — Catalog of Models, Contexts & Pricing
// =======================================================

export const MODEL_CATALOG = [
  {
    id: "claude-3-5-sonnet",
    providerId: "claude",
    name: "Claude 3.5 Sonnet",
    contextWindow: 200000,
    capabilities: ["code", "vision", "reasoning", "tools"],
    costPer1k: { input: 0.003, output: 0.015 },
    defaultTaskScope: "coding",
  },
  {
    id: "gpt-4o",
    providerId: "openai",
    name: "GPT-4o",
    contextWindow: 128000,
    capabilities: ["code", "vision", "tools", "json"],
    costPer1k: { input: 0.005, output: 0.015 },
    defaultTaskScope: "general",
  },
  {
    id: "gemini-1-5-pro",
    providerId: "gemini",
    name: "Gemini 1.5 Pro",
    contextWindow: 1000000,
    capabilities: ["ultra-context", "vision", "audio"],
    costPer1k: { input: 0.00125, output: 0.005 },
    defaultTaskScope: "research",
  },
  {
    id: "deepseek-r1",
    providerId: "deepseek",
    name: "DeepSeek R1 Reasoning",
    contextWindow: 64000,
    capabilities: ["math", "reasoning", "code"],
    costPer1k: { input: 0.00055, output: 0.00219 },
    defaultTaskScope: "reasoning",
  },
  {
    id: "llama3-70b-groq",
    providerId: "groq",
    name: "Llama 3 70B (Groq)",
    contextWindow: 8192,
    capabilities: ["fast", "chat", "code"],
    costPer1k: { input: 0.00059, output: 0.00079 },
    defaultTaskScope: "fast",
  },
  {
    id: "ollama-llama3",
    providerId: "ollama",
    name: "Ollama Llama3 (Local)",
    contextWindow: 8192,
    capabilities: ["offline", "privacy", "code"],
    costPer1k: { input: 0.0, output: 0.0 },
    defaultTaskScope: "local",
  },
];

export const modelRegistry = {
  getModel: (modelId) => MODEL_CATALOG.find((m) => m.id === modelId) || MODEL_CATALOG[0],
  getAllModels: () => [...MODEL_CATALOG],
  getCatalog: () => [...MODEL_CATALOG],
  getModelsByTask: (task) => MODEL_CATALOG.filter((m) => m.defaultTaskScope === task),
};

export default modelRegistry;
