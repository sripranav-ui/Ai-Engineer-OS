// =======================================================
// aiController.js — Unified Backend AI Gateway Controller
// =======================================================

import { sendSuccess, sendError } from "../utils/response.js";

export const chatCompletions = async (req, res, next) => {
  try {
    const { prompt, provider = "openai", roleId = "mentor" } = req.body;
    if (!prompt) {
      return sendError(res, "Prompt text is required");
    }

    const responseText = `[AI Backend Output (${provider})] Processed prompt using role "${roleId}":\n\n${prompt}`;
    return sendSuccess(res, "AI completions generated", { response: responseText });
  } catch (err) {
    next(err);
  }
};

export default { chatCompletions };
