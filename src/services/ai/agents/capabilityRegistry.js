/**
 * @file capabilityRegistry.js
 * @description Catalog of supported specialized AI Agent roles and capabilities.
 */

export const AGENT_ROLES = [
  { id: "ResearchAgent", role: "researcher", capabilities: ["research", "rag:search", "doc:analyze"] },
  { id: "CodingAgent", role: "coder", capabilities: ["code", "code:generate", "code:refactor"] },
  { id: "DebugAgent", role: "debugger", capabilities: ["debug", "error:analyze"] },
  { id: "TestingAgent", role: "tester", capabilities: ["test", "test:generate"] },
  { id: "PlanningAgent", role: "planner", capabilities: ["plan", "sprint:plan"] },
  { id: "DocumentationAgent", role: "doc_writer", capabilities: ["docs", "doc:generate"] },
  { id: "MemoryAgent", role: "memory_manager", capabilities: ["memory", "memory:pin"] },
  { id: "WorkflowAgent", role: "workflow_manager", capabilities: ["workflow", "workflow:run"] },
  { id: "DevOpsAgent", role: "devops", capabilities: ["devops", "deploy"] },
  { id: "DataScienceAgent", role: "data_scientist", capabilities: ["data", "csv:analyze"] },
  { id: "UIDesignAgent", role: "ui_designer", capabilities: ["ui", "css:generate"] },
  { id: "ReviewerAgent", role: "reviewer", capabilities: ["review", "code:review"] },
];

export const capabilityRegistry = {
  getAgentByCapability: (requiredCapability) => {
    if (!requiredCapability) return AGENT_ROLES[1];
    return (
      AGENT_ROLES.find(
        (a) => a && Array.isArray(a.capabilities) && a.capabilities.includes(requiredCapability)
      ) || AGENT_ROLES[1]
    );
  },
  getAllRoles: () => [...AGENT_ROLES],
};

export default capabilityRegistry;
