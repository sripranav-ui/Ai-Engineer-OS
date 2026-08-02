// =======================================================
// contextEngine.js — Application Context Aggregator
// =======================================================
// Collects contextual snapshots from across the application
// modules to feed the AI prompt engine automatically.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

export const contextEngine = {
  /**
   * Collects global system context snapshot
   */
  getSystemContext: () => {
    try {
      const activeWorkspaceId = storageService.get("active_workspace_id", "ai-engineering");
      const activeWorkspace   = storageService.get("multi_workspaces");
      const profileName       = storageService.get("profileName", "Developer");
      const currentDay        = storageService.get("currentDay", 1);
      const userXp             = storageService.get("userXp", 0);
      const theme             = storageService.get("theme", "light");

      return {
        timestamp: new Date().toISOString(),
        activeWorkspaceId,
        user: {
          name: profileName,
          day: currentDay,
          xp: userXp,
          level: Math.floor(userXp / 500) + 1,
        },
        environment: {
          theme,
          url: window.location.pathname,
        },
      };
    } catch (err) {
      logger.error("[ContextEngine] Error building system context:", err);
      return {};
    }
  },

  /**
   * Collects domain-specific workspace context
   * @param {string} domain - "dashboard" | "projects" | "learning" | "notes" | "career" | "analytics"
   */
  getDomainContext: (domain = "dashboard") => {
    try {
      switch (domain) {
        case "projects": {
          const raw = storageService.get("projects_data");
          const projects = raw ? JSON.parse(raw) : [];
          return {
            activeProjectsCount: projects.filter((p) => p.status !== "Completed").length,
            recentProjects: projects.slice(0, 3).map((p) => ({ title: p.title, status: p.status, progress: p.progress })),
          };
        }
        case "learning": {
          const day = storageService.get("currentDay", 1);
          return {
            currentDay: day,
            learningTarget: `Day ${day} AI Engineering Module`,
          };
        }
        case "notes": {
          const raw = storageService.get("knowledge_notes");
          const notes = raw ? JSON.parse(raw) : [];
          return {
            totalNotes: notes.length,
            recentTitles: notes.slice(0, 5).map((n) => n.title),
          };
        }
        case "career": {
          const targetRole = storageService.get("target_career_role", "AI Specialist");
          return { targetRole };
        }
        default:
          return {};
      }
    } catch {
      return {};
    }
  },

  /**
   * Compiles full context block string to append to AI prompts
   */
  compileContextPrompt: (activeDomain = "dashboard") => {
    const sys = contextEngine.getSystemContext();
    const domain = contextEngine.getDomainContext(activeDomain);

    const parts = [
      `User Profile: ${sys.user?.name || "Developer"} (Level ${sys.user?.level || 1}, Day ${sys.user?.day || 1})`,
      `Active Route: ${sys.environment?.url || "/"}`,
      `Active Workspace: ${sys.activeWorkspaceId || "default"}`,
    ];

    if (domain.recentProjects) {
      parts.push(`Recent Projects: ${domain.recentProjects.map((p) => `${p.title} (${p.status})`).join(", ")}`);
    }

    if (domain.targetRole) {
      parts.push(`Target Career Goal: ${domain.targetRole}`);
    }

    return parts.join("\n");
  },
};

export default contextEngine;
