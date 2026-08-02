import providerRegistry from "./registry/providerRegistry";
import OpenAIProvider from "./providers/openAIProvider";
import ClaudeProvider from "./providers/claudeProvider";
import GroqProvider from "./providers/groqProvider";
import OllamaProvider from "./providers/ollamaProvider";

// Auto-register core providers
providerRegistry.registerProvider(new OpenAIProvider());
providerRegistry.registerProvider(new ClaudeProvider());
providerRegistry.registerProvider(new GroqProvider());
providerRegistry.registerProvider(new OllamaProvider());

export * from "./providers/baseProvider";
export * from "./registry/modelRegistry";
export * from "./registry/providerRegistry";
export * from "./router/smartRouter";
export * from "./execution/fallbackManager";
export * from "./execution/executionPipeline";
