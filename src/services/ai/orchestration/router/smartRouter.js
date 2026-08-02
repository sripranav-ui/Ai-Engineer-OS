// =======================================================
// smartRouter.js — Intelligent Task-Based Model Router
// =======================================================

import modelRegistry from "../registry/modelRegistry";
import logger from "../../../../utils/logger";

export const smartRouter = {
  /**
   * Automatically select best model and provider based on task scope or role
   * @param {string} taskScope - "coding" | "fast" | "reasoning" | "research" | "local" | "general"
   * @param {string} [manualOverrideModelId] - optional user override model
   */
  route: (taskScope = "general", manualOverrideModelId = null) => {
    if (manualOverrideModelId) {
      logger.info(`[SmartRouter] Manual override model selected: "${manualOverrideModelId}".`);
      return modelRegistry.getModel(manualOverrideModelId);
    }

    const matches = modelRegistry.getModelsByTask(taskScope);
    const selected = matches.length > 0 ? matches[0] : modelRegistry.getModel("gpt-4o");

    logger.info(`[SmartRouter] Auto-routed task "${taskScope}" -> Model "${selected.name}" (${selected.providerId}).`);
    return selected;
  },
};

export default smartRouter;
