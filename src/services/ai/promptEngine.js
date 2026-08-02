// =======================================================
// promptEngine.js — Centralized Prompt Construction & Roles
// =======================================================
// Constructs system & user prompts combining Agent Persona,
// Workspace Context, User Memory, and Templates.
// =======================================================

import contextEngine from "./contextEngine";

export const AGENT_ROLES = {
  MENTOR: {
    id: "mentor",
    name: "AI Engineer Mentor",
    systemPrompt: "You are a Senior AI Lead and Mentor guiding an ambitious engineer through AI specialization.",
  },
  CODER: {
    id: "coder",
    name: "Coding Assistant",
    systemPrompt: "You are a Principal Software Architect specializing in Python, PyTorch, React, and LLM orchestration.",
  },
  PM: {
    id: "pm",
    name: "Project Manager",
    systemPrompt: "You are an AI Product & Project Director helping break down features into concrete sprint tasks.",
  },
  CAREER: {
    id: "career",
    name: "Career Coach",
    systemPrompt: "You are a Tech Career Coach expert in STAR interview prep, resume optimization, and placement readiness.",
  },
  LEARNING: {
    id: "learning",
    name: "Learning Guide",
    systemPrompt: "You are an AI Curriculum Specialist explaining complex machine learning & neural network concepts simply.",
  },
};

const TEMPLATES = {
  codeOptimize:  "Optimize the following {language} code for performance and memory efficiency:\n\n```{language}\n{code}\n```",
  codeDebug:     "Identify bugs, edge cases, and syntax errors in this {language} snippet:\n\n```{language}\n{code}\n```",
  starInterview: "Evaluate this candidate STAR interview answer for role {role}:\nQuestion: {question}\nAnswer: {answer}",
  taskBreakdown: "Break down this project goal into 5 prioritized, actionable technical tasks:\nGoal: {goal}",
  explainConcept:"Explain the concept of {concept} with a real-world software engineering analogy and Python example.",
};

export const promptEngine = {
  /**
   * Compiles template text with variables
   */
  compileTemplate: (templateId, variables = {}) => {
    let tpl = TEMPLATES[templateId] || "";
    Object.keys(variables).forEach((key) => {
      tpl = tpl.replace(new RegExp(`\\{${key}\\}`, "g"), variables[key]);
    });
    return tpl;
  },

  /**
   * Registers new prompt template dynamically
   */
  registerTemplate: (id, text) => {
    TEMPLATES[id] = text;
  },

  /**
   * Builds complete system prompt including agent role & app context
   */
  buildSystemPrompt: (roleId = "mentor", includeContext = true) => {
    const role = Object.values(AGENT_ROLES).find((r) => r.id === roleId) || AGENT_ROLES.MENTOR;
    let system = role.systemPrompt;

    if (includeContext) {
      const contextStr = contextEngine.compileContextPrompt();
      system += `\n\n--- CURRENT WORKSPACE CONTEXT ---\n${contextStr}\n--- END CONTEXT ---`;
    }

    return system;
  },

  /**
   * Builds combined full prompt payload
   */
  buildPrompt: ({ userQuery, roleId = "mentor", templateId, templateVars, extraContext }) => {
    let promptText = userQuery;

    if (templateId && TEMPLATES[templateId]) {
      promptText = promptEngine.compileTemplate(templateId, templateVars);
    }

    if (extraContext) {
      promptText = `[Context: ${extraContext}]\n\n${promptText}`;
    }

    const systemPrompt = promptEngine.buildSystemPrompt(roleId);

    return {
      systemPrompt,
      promptText,
    };
  },
};

export default promptEngine;
