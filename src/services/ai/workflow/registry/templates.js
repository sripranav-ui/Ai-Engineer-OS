/**
 * @file templates.js
 * @description Catalog of pre-configured reusable workflow templates for AI Engineer OS.
 */

import workflowRegistry from "./workflowRegistry.js";
import logger from "../../../../utils/logger.js";

export const WORKFLOW_TEMPLATES = [
  {
    id: "template_ai_research",
    name: "AI Research Pipeline",
    version: "1.0.0",
    description: "Ingests topic, performs RAG knowledge retrieval, delegates analysis to Research Agent, and saves a summary note.",
    category: "Research",
    nodes: [
      { id: "node_start", type: "start", label: "Start Research" },
      { id: "node_agent_research", type: "agent", label: "Research Agent Step", config: { agentRole: "researcher", goal: "Perform deep research on target topic" } },
      { id: "node_tool_note", type: "tool", label: "Save Research Note", config: { toolId: "create_note" } },
      { id: "node_end", type: "end", label: "End Pipeline" },
    ],
    edges: [
      { source: "node_start", target: "node_agent_research" },
      { source: "node_agent_research", target: "node_tool_note" },
      { source: "node_tool_note", target: "node_end" },
    ],
  },
  {
    id: "template_project_bootstrap",
    name: "Project Bootstrap Pipeline",
    version: "1.0.0",
    description: "Creates software project, decomposes feature tasks with PM Agent, and initializes Kanban board.",
    category: "Projects",
    nodes: [
      { id: "node_start", type: "start", label: "Start Bootstrap" },
      { id: "node_tool_create_proj", type: "tool", label: "Create Project Tool", config: { toolId: "create_project" } },
      { id: "node_agent_pm", type: "agent", label: "PM Task Decomposition", config: { agentRole: "pm", goal: "Decompose features into task backlog" } },
      { id: "node_end", type: "end", label: "End Bootstrap" },
    ],
    edges: [
      { source: "node_start", target: "node_tool_create_proj" },
      { source: "node_tool_create_proj", target: "node_agent_pm" },
      { source: "node_agent_pm", target: "node_end" },
    ],
  },
  {
    id: "template_daily_study",
    name: "Daily Study Planner",
    version: "1.0.0",
    description: "Fetches active day module, runs spaced repetition flashcards tool, and invokes Learning Coach Agent.",
    category: "Learning",
    nodes: [
      { id: "node_start", type: "start", label: "Start Daily Study" },
      { id: "node_agent_coach", type: "agent", label: "Learning Coach Step", config: { agentRole: "mentor", goal: "Generate daily study plan and flashcard review" } },
      { id: "node_end", type: "end", label: "End Planner" },
    ],
    edges: [
      { source: "node_start", target: "node_agent_coach" },
      { source: "node_agent_coach", target: "node_end" },
    ],
  },
  {
    id: "template_code_review",
    name: "Automated Code Review",
    version: "1.0.0",
    description: "Inspects source files, executes Coding Specialist Agent, and requires human approval before committing.",
    category: "Engineering",
    nodes: [
      { id: "node_start", type: "start", label: "Start Review" },
      { id: "node_agent_coder", type: "agent", label: "Coding Agent Review", config: { agentRole: "coder", goal: "Perform code quality and security review" } },
      { id: "node_approval", type: "approval", label: "Human Approval Pause", config: { prompt: "Approve code changes?" } },
      { id: "node_end", type: "end", label: "End Review" },
    ],
    edges: [
      { source: "node_start", target: "node_agent_coder" },
      { source: "node_agent_coder", target: "node_approval" },
      { source: "node_approval", target: "node_end" },
    ],
  },
];

/**
 * Auto-registers template workflows into workflowRegistry.
 */
export function registerTemplates() {
  WORKFLOW_TEMPLATES.forEach((tmpl) => {
    try {
      workflowRegistry.registerWorkflow(tmpl);
    } catch (err) {
      logger.error(`[Templates] Error registering template "${tmpl.id}":`, err);
    }
  });
}

// Auto-register templates on load
registerTemplates();

export default WORKFLOW_TEMPLATES;
