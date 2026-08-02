// =======================================================
// executionPipeline.js — Multi-LLM Execution Pipeline
// =======================================================

import smartRouter from "../router/smartRouter";
import fallbackManager from "./fallbackManager";
import logger from "../../../../utils/logger";

export const executionPipeline = {
  /**
   * Process prompt request using smart routing and fallback execution
   * @param {object} params
   * @param {string} params.prompt
   * @param {string} [params.taskScope]
   * @param {string} [params.systemPrompt]
   * @param {string} [params.overrideModelId]
   */
  process: async ({ prompt, taskScope = "general", systemPrompt = "", overrideModelId = null }) => {
    logger.info(`[ExecutionPipeline] Processing completion request (taskScope: "${taskScope}")...`);

    const modelSpec = smartRouter.route(taskScope, overrideModelId);

    const res = await fallbackManager.executeWithFallback(modelSpec.providerId, prompt, {
      systemPrompt,
      model: modelSpec.id,
    });

    return {
      text: res.result,
      modelUsed: modelSpec.id,
      providerUsed: res.providerId,
      fallbackOccurred: res.fallbackOccurred,
    };
  },
};

export default executionPipeline;
