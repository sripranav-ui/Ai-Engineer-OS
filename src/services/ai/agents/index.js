import agentRegistry from "./registry/agentRegistry.js";
import CodingAgent from "./implementations/codingAgent.js";
import ResearchAgent from "./implementations/researchAgent.js";
import ProjectManagerAgent from "./implementations/projectManagerAgent.js";
import CareerMentorAgent from "./implementations/careerMentorAgent.js";

// Auto-register concrete agents into registry
agentRegistry.registerAgent(new CodingAgent());
agentRegistry.registerAgent(new ResearchAgent());
agentRegistry.registerAgent(new ProjectManagerAgent());
agentRegistry.registerAgent(new CareerMentorAgent());

export * from "./base/baseAgent.js";
export * from "./base/agentContext.js";
export * from "./tasks/taskTypes.js";
export * from "./tasks/taskQueue.js";
export * from "./planner/plannerEngine.js";
export * from "./registry/agentRegistry.js";
export * from "./orchestrator/agentOrchestrator.js";
export * from "./observability/metricsTracker.js";
export * from "./goalManager.js";
export * from "./taskPlanner.js";
export * from "./executionPlanner.js";
export * from "./capabilityRegistry.js";
export * from "./delegationEngine.js";
export * from "./agentCommunicationBus.js";
export * from "./consensusEngine.js";
export * from "./agentSupervisor.js";
export * from "./executionMonitor.js";
export * from "./retryManager.js";
export * from "./failureRecovery.js";
export * from "./agentHealthMonitor.js";
export * from "./agentTelemetry.js";
export * from "./executionHistory.js";
export * from "./collaborationEngine.js";
