// =======================================================
// contextBuilderService.js — Prioritized Context Aggregator
// =======================================================
// Assembles all memory layers according to strict priority order:
//   1. Current Page & Route
//   2. Current Project & Active Task
//   3. Active Workflow & Execution Status
//   4. Current Conversation Messages
//   5. Pinned Memories & Notes
//   6. Long-Term Memory & User Preferences
// =======================================================

import shortTermMemory from "./shortTermMemory.js";
import longTermMemory from "./longTermMemory.js";
import conversationMemory from "./conversationMemory.js";
import workspaceContextService from "./workspaceContextService.js";
import { createContextPayloadShape, MEMORY_PRIORITY } from "./types.js";
import logger from "../../../utils/logger.js";

export class ContextBuilderService {
  /**
   * Compiles prioritized context payload for AI assistant
   * @param {string} [conversationId] - active chat session ID
   */
  buildContext(conversationId) {
    logger.info("[ContextBuilderService] Assembling prioritized AI context payload...");

    const shortTerm = shortTermMemory.getMemory();
    const longTerm = longTermMemory.getMemory();
    const workspace = workspaceContextService.getContext();

    let conversationMsgs = [];
    if (conversationId) {
      const conv = conversationMemory.getConversation(conversationId);
      if (conv) conversationMsgs = conv.messages.slice(-6);
    }

    const payload = createContextPayloadShape({
      workspace,
      project: workspace.activeProject,
      shortTerm,
      activeWorkflow: shortTerm.activeWorkflow,
      conversation: conversationMsgs,
      pinned: longTerm.pinnedNotes,
      longTerm,
      preferences: {
        targetRole: longTerm.targetRole,
        languages: longTerm.preferredLanguages,
        instructions: longTerm.customInstructions,
      },
    });

    return payload;
  }

  /**
   * Formats compiled context payload into system prompt string
   */
  formatSystemPromptContext(conversationId) {
    const ctx = this.buildContext(conversationId);

    const parts = [
      `=== AI ENGINEER OS SYSTEM CONTEXT ===`,
      `[1. Current Page]: ${ctx.shortTerm.activePage}`,
      `[2. Active Project]: ${ctx.project ? ctx.project.title : "None"}`,
    ];

    if (ctx.activeWorkflow) {
      parts.push(`[3. Active Workflow]: ${ctx.activeWorkflow.workflowName} (${ctx.activeWorkflow.status})`);
    }

    parts.push(`[4. Preferences & Target Role]: ${ctx.preferences.targetRole} (${ctx.preferences.languages.join(", ")})`);

    if (ctx.preferences.instructions) {
      parts.push(`[Custom User Instructions]: ${ctx.preferences.instructions}`);
    }

    if (ctx.pinned.length > 0) {
      parts.push(`[5. Pinned Memories]:\n` + ctx.pinned.map((p) => `- ${p.title || p.text}`).join("\n"));
    }

    parts.push(`=== END SYSTEM CONTEXT ===`);

    return parts.join("\n\n");
  }
}

export const contextBuilderService = new ContextBuilderService();
export default contextBuilderService;
