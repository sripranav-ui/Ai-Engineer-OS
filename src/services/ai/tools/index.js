import toolRegistry from "./registry/toolRegistry.js";
import { CreateProjectTool } from "./implementations/projectTools.js";
import { SearchNotesTool } from "./implementations/noteTools.js";
import { CreateTaskTool } from "./implementations/taskTools.js";

// Auto-register core tool suite
toolRegistry.registerTool(new CreateProjectTool());
toolRegistry.registerTool(new SearchNotesTool());
toolRegistry.registerTool(new CreateTaskTool());

export * from "./base/baseTool.js";
export * from "./base/executionContext.js";
export * from "./runtime/permissionManager.js";
export * from "./runtime/argumentValidator.js";
export * from "./runtime/resultValidator.js";
export * from "./runtime/toolExecutor.js";
export * from "./registry/toolRegistry.js";
export * from "./observability/toolLogger.js";
export * from "./observability/toolMetrics.js";
