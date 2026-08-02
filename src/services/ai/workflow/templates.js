/**
 * @file templates.js
 * @description Pre-built Workflow templates for Workflow Builder.
 */

export const AI_RESEARCH_PIPELINE = {
  id: "tpl_research_pipeline",
  name: "AI Research & Synthesis Pipeline",
  description: "Multi-agent research workflow gathering RAG context and generating summary notes.",
  nodes: [
    { id: "start_1", type: "start", x: 100, y: 150, data: { label: "Start Trigger" } },
    { id: "agent_1", type: "agent", x: 320, y: 150, data: { label: "Research Agent", agentRole: "researcher" } },
    { id: "end_1", type: "end", x: 550, y: 150, data: { label: "End Pipeline" } },
  ],
  edges: [
    { id: "e1", source: "start_1", target: "agent_1" },
    { id: "e2", source: "agent_1", target: "end_1" },
  ],
};

export const CODE_REVIEW_PIPELINE = {
  id: "tpl_code_review",
  name: "Automated Code Review & Testing",
  description: "Runs static check tools, reviewer agent, and requires human approval before merge.",
  nodes: [
    { id: "start_2", type: "start", x: 80, y: 150, data: { label: "PR Opened Trigger" } },
    { id: "tool_1", type: "tool", x: 260, y: 150, data: { label: "Run Linter Tool" } },
    { id: "agent_2", type: "agent", x: 440, y: 150, data: { label: "Reviewer Agent", agentRole: "reviewer" } },
    { id: "approval_1", type: "approval", x: 620, y: 150, data: { label: "Human Approval Gate" } },
    { id: "end_2", type: "end", x: 800, y: 150, data: { label: "Merge Workflow" } },
  ],
  edges: [
    { id: "e20", source: "start_2", target: "tool_1" },
    { id: "e21", source: "tool_1", target: "agent_2" },
    { id: "e22", source: "agent_2", target: "approval_1" },
    { id: "e23", source: "approval_1", target: "end_2" },
  ],
};

export const REUSABLE_TEMPLATES = {
  AI_RESEARCH_PIPELINE,
  CODE_REVIEW_PIPELINE,
};

export default REUSABLE_TEMPLATES;
