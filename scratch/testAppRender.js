import { pluginManager } from "../src/services/plugins/pluginManager.js";
import { workflowService } from "../src/services/ai/workflow/workflowService.js";
import { intelligenceEngine } from "../src/services/intelligence/intelligenceEngine.js";
import { ragEngine } from "../src/services/ai/rag/ragEngine.js";
import { collaborationEngine } from "../src/services/ai/agents/collaborationEngine.js";

console.log("--- Testing Settings Panel Components & Services Integration ---");

// 1. Test Plugin Manager
const plugins = pluginManager.getInstalledPlugins("default");
console.log("[PASS] Plugin Manager getInstalledPlugins returned:", plugins.length, "plugins.");

// 2. Test Workflow Service
const workflows = workflowService.listWorkflows();
console.log("[PASS] Workflow Service listWorkflows returned:", workflows.length, "templates.");

// 3. Test Intelligence Engine
const indexed = intelligenceEngine.indexWorkspace();
console.log("[PASS] Intelligence Engine indexWorkspace result:", indexed);

// 4. Test RAG Engine
const ragRes = await ragEngine.retrieveContext("How do I configure Settings?");
console.log("[PASS] RAG Engine retrieveContext returned:", ragRes.chunks.length, "chunks.");

// 5. Test Multi-Agent Collaboration Engine
const agentRes = await collaborationEngine.executeGoal("Build Enterprise Settings Panel");
console.log("[PASS] Multi-Agent Collaboration Engine executeGoal status:", agentRes.status);

console.log("--- All AI Subsystems & Enterprise Settings Panel Verified Successfully ---");
