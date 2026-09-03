/**
 * @file aiOrchestrator.js
 * @description Provider-Agnostic Master AI Orchestrator for AI Engineer OS.
 * Sits between UI views and providerManager. Coordinates Intent Detection, Planner Execution,
 * Knowledge RAG Retrieval, Studio Context Gathering, Prompt Construction, and LLM Provider Completion.
 * Phase 6: Extended with Agent Executor for autonomous engineering workflows.
 */

import plannerService from "./plannerService.js";
import toolRegistryService from "./toolRegistry.js";
import ragContextBuilder from "../rag/contextBuilder.js";
import providerManager from "../providers/providerManager.js";
import conversationMemory from "../memory/conversationMemory.js";
import agentExecutor from "../agent/agentExecutor.js";
import workspaceScanner from "../agent/workspaceScanner.js";
import projectIndexer from "../agent/projectIndexer.js";
import progressTracker from "../agent/progressTracker.js";
import { SYSTEM_PROMPTS } from "../../../config/prompts.js";
import logger from "../../../utils/logger.js";

export class AIOrchestrator {
  /**
   * Process incoming user AI request through the complete Orchestration Pipeline
   * @param {Object} payload - Request payload ({ promptText, conversationId, modelId, useRag, studioContext, attachments, agentMode })
   * @param {Function} [onChunk] - Streaming token callback
   * @param {AbortSignal} [signal] - AbortController signal
   * @returns {Promise<{ plan: Object, ragSources: Array, hasKnowledge: boolean, text: string, agentResult?: Object }>}
   */
  async processRequest(payload = {}, onChunk = null, signal = null) {
    const {
      promptText = "",
      conversationId = null,
      modelId = null,
      useRag = true,
      studioContext = null,
      attachments = [],
      agentMode = false,
      workspacesData = null,
    } = payload;

    const startTime = performance.now();

    // 1. Generate Structured Execution Plan via Planner
    const plan = plannerService.generatePlan(promptText, {
      useRag,
      hasStudioContext: Boolean(studioContext && studioContext.activeTab),
      hasAttachments: attachments.length > 0,
      activeTab: studioContext?.activeTab,
      language: studioContext?.language,
    });

    logger.info(`[AIOrchestrator] Execution Plan generated for intent "${plan.intent}" (${Math.round(plan.confidence * 100)}% confidence):`, plan);

    // 2. Agent Mode: Run full autonomous pipeline
    let agentResult = null;
    if (agentMode) {
      agentResult = await agentExecutor.execute({
        requestDescription: promptText,
        plan,
        workspacesData: workspacesData || {},
        onProgress: (snapshot) => {
          logger.info(`[AIOrchestrator] Agent Progress: ${snapshot.state}`);
        },
      });
    }

    // 3. Gather RAG Knowledge Context if plan includes 'rag'
    let ragSources = [];
    let hasKnowledge = false;
    let ragFormattedContext = "";

    if (plan.useKnowledge && useRag !== false) {
      try {
        const ragResult = await ragContextBuilder.buildRAGContext(promptText, { topK: 6 });
        if (ragResult && ragResult.hasKnowledge) {
          hasKnowledge = true;
          ragSources = ragResult.sources || [];
          ragFormattedContext = ragResult.formattedContext || "";
        }
      } catch (err) {
        logger.warn("[AIOrchestrator] RAG context gathering failed:", err);
      }
    }

    // 4. Build Provider-Agnostic System Prompt
    let systemPrompt = SYSTEM_PROMPTS.BASE_ASSISTANT;

    if (agentMode) {
      systemPrompt += SYSTEM_PROMPTS.AGENT_MODE;
    }

    if (plan.intent === "planning") {
      systemPrompt += SYSTEM_PROMPTS.PLANNING_STRUCTURE;
    }

    if (hasKnowledge && ragFormattedContext) {
      systemPrompt +=
        "\n=== RELEVANT KNOWLEDGE CONTEXT ===\n" +
        ragFormattedContext +
        "\n===================================\n" +
        SYSTEM_PROMPTS.KNOWLEDGE_INSTRUCTION;
    }

    if (plan.useStudio && studioContext) {
      systemPrompt +=
        `\n=== ACTIVE STUDIO EDITOR CONTEXT ===\n` +
        `Active File: ${studioContext.activeTab || "main.py"}\n` +
        `Language: ${studioContext.language || "python"}\n` +
        `Buffer Content:\n\`\`\`${studioContext.language || "text"}\n${studioContext.activeContent || ""}\n\`\`\`\n` +
        `====================================\n`;
    }

    // 5. Inject Project Context from workspace scanner (if available)
    const projectSummary = workspaceScanner.getProjectSummary();
    if (projectSummary && projectSummary !== "No workspace scan available.") {
      systemPrompt += `\n=== PROJECT CONTEXT ===\n${projectSummary}\n========================\n`;
    }

    // 6. Agent execution results context
    if (agentResult && agentResult.success) {
      systemPrompt += `\n=== AGENT EXECUTION RESULTS ===\n`;
      systemPrompt += `Tasks Completed: ${agentResult.taskResults?.length || 0}\n`;
      systemPrompt += `Validation: ${agentResult.validationResult?.summary || "N/A"}\n`;
      systemPrompt += `Diffs Generated: ${agentResult.diffs?.length || 0}\n`;
      systemPrompt += `Checkpoint: ${agentResult.checkpointId || "None"}\n`;
      systemPrompt += `=================================\n`;
    }

    // 7. Gather Conversation Memory History
    let historyForPayload = [];
    if (conversationId && plan.useMemory) {
      const conv = conversationMemory.getConversation(conversationId);
      if (conv && Array.isArray(conv.messages)) {
        historyForPayload = conv.messages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text || m.content || "",
        }));
      }
    }

    // Prepare Messages Array for Provider
    const messagesPayload = [
      { role: "system", content: systemPrompt },
      ...historyForPayload,
      { role: "user", content: promptText },
    ];

    const options = {
      model: modelId,
      signal,
    };

    // 8. Delegate Completion Execution exclusively to providerManager
    let completionText = "";

    if (onChunk && typeof onChunk === "function") {
      const streamRes = await providerManager.streamMessage(messagesPayload, options, (chunkText) => {
        completionText += chunkText;
        onChunk(chunkText);
      });
      completionText = streamRes.text || completionText;
    } else {
      const res = await providerManager.sendMessage(messagesPayload, options);
      completionText = res.text || "";
    }

    const durationMs = Math.round(performance.now() - startTime);
    logger.info(`[AIOrchestrator] Completed request processing in ${durationMs}ms.`);

    return {
      plan,
      ragSources,
      hasKnowledge,
      text: completionText,
      durationMs,
      agentResult,
    };
  }

  /** Expose Tool Registry Interface */
  getToolRegistry() {
    return toolRegistryService;
  }

  /** Expose Agent Executor */
  getAgentExecutor() {
    return agentExecutor;
  }

  /** Expose Progress Tracker */
  getProgressTracker() {
    return progressTracker;
  }

  /** Expose Project Indexer */
  getProjectIndexer() {
    return projectIndexer;
  }
}

export const aiOrchestrator = new AIOrchestrator();
export default aiOrchestrator;
