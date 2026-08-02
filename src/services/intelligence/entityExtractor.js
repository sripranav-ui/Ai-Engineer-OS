/**
 * @file entityExtractor.js
 * @description Entity node factory formatting OS entities into normalized Knowledge Graph nodes.
 */

export const ENTITY_TYPES = {
  PROJECT:          "Project",
  TASK:             "Task",
  ROADMAP:          "Roadmap",
  DOCUMENT:         "Document",
  CODE_FILE:        "CodeFile",
  FOLDER:           "Folder",
  CONVERSATION:     "Conversation",
  MEMORY:           "Memory",
  WORKFLOW:         "Workflow",
  WORKFLOW_RUN:     "WorkflowRun",
  AGENT:            "Agent",
  PLUGIN:           "Plugin",
  MCP_SERVER:       "MCPServer",
  KNOWLEDGE_SOURCE: "KnowledgeSource",
  PROMPT:           "Prompt",
  TOOL:             "Tool",
  GOAL:             "Goal",
  MILESTONE:        "Milestone",
  SKILL:            "Skill",
};

export const entityExtractor = {
  /**
   * Creates a normalized Entity Node object.
   * @param {string} id
   * @param {string} type - Member of ENTITY_TYPES
   * @param {string} title
   * @param {Object} [metadata={}]
   * @returns {Object} Node shape
   */
  createNode: (id, type, title, metadata = {}) => ({
    id,
    type,
    title: title || id,
    metadata,
    createdAt: new Date().toISOString(),
  }),
};

export default entityExtractor;
