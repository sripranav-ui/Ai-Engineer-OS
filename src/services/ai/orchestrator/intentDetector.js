/**
 * @file intentDetector.js
 * @description Intent Classifier for AI Engineer OS Orchestration Layer.
 * Analyzes prompt text, keywords, syntax patterns, and context to classify user intent.
 */

export class IntentDetectorService {
  /**
   * Classify user prompt intent with confidence score
   * @param {string} promptText - User input prompt
   * @param {Object} [context={}] - Context metadata ({ hasStudioContext, hasAttachments, useRag })
   * @returns {{ intent: string, confidence: number }}
   */
  detectIntent(promptText = "", context = {}) {
    if (!promptText || !promptText.trim()) {
      return { intent: "general_chat", confidence: 1.0 };
    }

    const text = promptText.toLowerCase().trim();

    // 1. Planning Intent
    if (/\b(plan|roadmap|architecture|timeline|tasks|milestone|design spec)\b/.test(text)) {
      return { intent: "planning", confidence: 0.95 };
    }

    // 2. Bug Fix Intent
    if (/\b(fix|bug|error|issue|debug|crash|exception|failing)\b/.test(text)) {
      return { intent: "bug_fix", confidence: 0.92 };
    }

    // 3. Refactoring Intent
    if (/\b(refactor|optimize|clean up|restructure|simplify|improve)\b/.test(text)) {
      return { intent: "refactoring", confidence: 0.90 };
    }

    // 4. File Generation Intent
    if (/\b(create file|generate file|new file|make file|write file)\b/.test(text)) {
      return { intent: "file_generation", confidence: 0.93 };
    }

    // 5. Documentation Intent
    if (/\b(doc|documentation|readme|comment|jsdoc|docstring)\b/.test(text)) {
      return { intent: "documentation", confidence: 0.88 };
    }

    // 6. Knowledge Search Intent
    if (/\b(search knowledge|find doc|lookup|vector search|rag search|in memory)\b/.test(text)) {
      return { intent: "knowledge_search", confidence: 0.94 };
    }

    // 7. Studio Action Intent
    if (/\b(insert|studio|editor|run code|execute)\b/.test(text) || context.hasStudioContext) {
      if (text.startsWith("/code") || /\b(code|function|class|const|def|import)\b/.test(text)) {
        return { intent: "coding", confidence: 0.92 };
      }
      return { intent: "studio_action", confidence: 0.85 };
    }

    // 8. Coding Intent
    if (
      text.startsWith("/code") ||
      /```[\s\S]*```/.test(promptText) ||
      /\b(code|function|script|algorithm|component|class|def|import|return)\b/.test(text)
    ) {
      return { intent: "coding", confidence: 0.91 };
    }

    // 9. Explanation Intent
    if (/\b(explain|how does|what is|why does|understand|overview)\b/.test(text)) {
      return { intent: "explanation", confidence: 0.89 };
    }

    // 10. General Chat Fallback
    return { intent: "general_chat", confidence: 0.80 };
  }
}

export const intentDetectorService = new IntentDetectorService();
export default intentDetectorService;
