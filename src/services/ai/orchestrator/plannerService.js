/**
 * @file plannerService.js
 * @description Planner Service for AI Engineer OS Orchestration Layer.
 * Analyzes prompt intent, confidence, and system state to produce a structured execution plan.
 */

import intentDetectorService from "./intentDetector.js";

export class PlannerService {
  /**
   * Produce structured execution plan for AI request
   * @param {string} promptText - User input prompt
   * @param {Object} [context={}] - Environment context ({ useRag, hasStudioContext, hasAttachments, activeTab, language })
   * @returns {{
   *   intent: string,
   *   confidence: number,
   *   useMemory: boolean,
   *   useKnowledge: boolean,
   *   useStudio: boolean,
   *   useAttachments: boolean,
   *   useTools: Array<string>,
   *   executionOrder: Array<string>
   * }}
   */
  generatePlan(promptText = "", context = {}) {
    const { intent, confidence } = intentDetectorService.detectIntent(promptText, context);

    const useRag = context.useRag !== false;
    const hasStudio = Boolean(context.hasStudioContext || context.activeTab);
    const hasAttachments = Boolean(context.hasAttachments || (context.attachments && context.attachments.length > 0));

    let useMemory = true;
    let useKnowledge = useRag;
    let useStudio = hasStudio;
    let useTools = [];
    const executionOrder = ["memory"];

    switch (intent) {
      case "coding":
      case "refactoring":
      case "bug_fix":
        useStudio = true;
        useTools = ["insert_code", "search_knowledge"];
        executionOrder.push("studio");
        if (useKnowledge) executionOrder.push("rag");
        break;

      case "planning":
        useKnowledge = true;
        useTools = ["search_knowledge"];
        if (useKnowledge) executionOrder.push("rag");
        if (useStudio) executionOrder.push("studio");
        break;

      case "documentation":
      case "knowledge_search":
        useKnowledge = true;
        useTools = ["search_knowledge"];
        executionOrder.push("rag");
        if (useStudio) executionOrder.push("studio");
        break;

      case "file_generation":
        useStudio = true;
        useTools = ["create_file", "insert_code"];
        if (useStudio) executionOrder.push("studio");
        if (useKnowledge) executionOrder.push("rag");
        break;

      case "studio_action":
        useStudio = true;
        useTools = ["insert_code", "run_terminal"];
        executionOrder.push("studio");
        break;

      case "explanation":
      case "general_chat":
      default:
        if (useKnowledge) executionOrder.push("rag");
        if (useStudio) executionOrder.push("studio");
        break;
    }

    executionOrder.push("provider");

    return {
      intent,
      confidence,
      useMemory,
      useKnowledge,
      useStudio,
      useAttachments: hasAttachments,
      useTools,
      executionOrder,
    };
  }
}

export const plannerService = new PlannerService();
export default plannerService;
