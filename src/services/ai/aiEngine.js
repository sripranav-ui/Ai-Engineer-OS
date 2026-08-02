import providers, { getProvider } from "./providers";
import promptEngine, { AGENT_ROLES } from "./promptEngine";
import contextEngine from "./contextEngine";
import memoryLayer from "./memoryLayer";
import toolEngine from "./toolEngine";
import streamingEngine from "./streamingEngine";
import conversationEngine from "./conversationEngine";
import aiSettingsService from "./aiSettings";
import executionPipeline from "./orchestration/execution/executionPipeline";
import logger from "../../utils/logger";

// =======================================================
// aiEngine.js — Unified AI Engine Brain
// =======================================================

export const aiEngine = {
  providers,
  prompts: promptEngine,
  context: contextEngine,
  memory: memoryLayer,
  tools: toolEngine,
  streaming: streamingEngine,
  conversations: conversationEngine,
  settings: aiSettingsService,
  orchestration: executionPipeline,
  roles: AGENT_ROLES,

  /**
   * Primary entry point to send a user message to the AI Engine
   */
  sendMessage: async ({ userQuery, conversationId, roleId = "mentor", onChunk, onComplete }) => {
    logger.info(`[AIEngine] Processing message for conversation "${conversationId}" with role "${roleId}"...`);

    const cfg = aiSettingsService.getSettings();

    const { systemPrompt, promptText } = promptEngine.buildPrompt({
      userQuery,
      roleId,
    });

    if (conversationId) {
      conversationEngine.appendMessage(conversationId, "user", userQuery);
    }

    try {
      // Execute pipeline with smart routing and fallbacks
      const pipelineRes = await executionPipeline.process({
        prompt: promptText,
        systemPrompt,
        taskScope: roleId === "coder" ? "coding" : "general",
      });

      const responseText = pipelineRes.text;

      if (cfg.enableStreaming && onChunk) {
        let accumulated = "";
        streamingEngine.streamText(
          responseText,
          (chunk) => {
            accumulated += chunk;
            onChunk(chunk, accumulated);
          },
          () => {
            if (conversationId) {
              conversationEngine.appendMessage(conversationId, "assistant", accumulated);
            }
            if (onComplete) onComplete(accumulated);
          }
        );
      } else {
        if (conversationId) {
          conversationEngine.appendMessage(conversationId, "assistant", responseText);
        }
        if (onComplete) onComplete(responseText);
        return responseText;
      }
    } catch (err) {
      logger.error("[AIEngine] Error generating response:", err);
      const fallbackMsg = "⚠️ I encountered an issue connecting to the AI provider. Please check your AI settings and network connection.";
      if (conversationId) {
        conversationEngine.appendMessage(conversationId, "assistant", fallbackMsg);
      }
      if (onComplete) onComplete(fallbackMsg);
      return fallbackMsg;
    }
  },
};

export default aiEngine;
