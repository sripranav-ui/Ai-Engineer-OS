/**
 * Pricing rates for supported AI providers (Prices per 1M tokens)
 */
const PRICING_RATES = {
  openai: { input: 5.0, output: 15.0 },     // GPT-4o pricing tier
  gemini: { input: 1.25, output: 5.0 },     // Gemini 1.5 Pro tier
  claude: { input: 3.0, output: 15.0 },     // Claude 3.5 Sonnet tier
  groq: { input: 0.5, output: 0.8 },        // LLaMA-3 70B pricing
  openrouter: { input: 1.0, output: 2.0 },  // Aggregation rates average
  ollama: { input: 0.0, output: 0.0 },      // Local models are free of charge
  deepseek: { input: 0.14, output: 0.28 }   // DeepSeek pricing tier
};

/**
 * Enterprise AI Pricing Estimator Service
 */
export const costCalculator = {
  /**
   * Estimates model call cost based on tokens metrics
   */
  calculate: (provider, inputTokens, outputTokens) => {
    const rate = PRICING_RATES[provider] || { input: 1.0, output: 2.0 };
    const inputCost = (inputTokens / 1_000_000) * rate.input;
    const outputCost = (outputTokens / 1_000_000) * rate.output;
    
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }
};

export default costCalculator;
