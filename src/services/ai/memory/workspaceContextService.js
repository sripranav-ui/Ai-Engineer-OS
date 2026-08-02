// =======================================================
// workspaceContextService.js — Workspace Context Tracking
// =======================================================
// Tracks current navigation route, active project, selected task,
// open document, active filters, and search queries automatically.
// =======================================================

import { createWorkspaceContextShape } from "./types.js";
import shortTermMemory from "./shortTermMemory.js";

class WorkspaceContextService {
  constructor() {
    this.context = createWorkspaceContextShape();
  }

  /** Get live workspace context */
  getContext() {
    return { ...this.context };
  }

  /** Update workspace context partially */
  updateContext(partial = {}) {
    this.context = createWorkspaceContextShape({ ...this.context, ...partial });

    if (partial.currentRoute) {
      shortTermMemory.setActivePage(partial.currentRoute);
    }

    return this.getContext();
  }

  /** Set active project */
  setActiveProject(project) {
    return this.updateContext({ activeProject: project });
  }

  /** Set active task */
  setSelectedTask(task) {
    return this.updateContext({ selectedTask: task });
  }
}

export const workspaceContextService = new WorkspaceContextService();
export default workspaceContextService;
