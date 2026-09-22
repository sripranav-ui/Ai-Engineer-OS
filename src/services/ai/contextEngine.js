// =======================================================
// contextEngine.js — Application Context Aggregator
// =======================================================
// Collects contextual snapshots from across the application
// modules to feed the AI prompt engine automatically.
// =======================================================

import storageService from "../storageService.js";
import logger from "../../utils/logger.js";

export const contextEngine = {
  /**
   * Collects global system context snapshot
   */
  getSystemContext: (workspaceId = "default", userId = null) => {
    try {
      const activeUserId = userId || storageService.getCurrentUserId();
      const activeWorkspaceId = workspaceId || storageService.get("active_workspace_id") || "default";
      const profileName = storageService.getInitialScopedData("profileName", activeUserId, "Developer");
      const currentDay = Number(storageService.getInitialScopedData("currentDay", activeUserId, 1)) || 1;
      const userXp = Number(storageService.getInitialScopedData("xp", activeUserId, 0)) || 0;
      const theme = storageService.get("theme") || "light";

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
          url: typeof window !== "undefined" ? window.location.pathname : "/",
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
  getDomainContext: (domain = "dashboard", workspaceId = "default", userId = null) => {
    try {
      const activeUserId = userId || storageService.getCurrentUserId();
      switch (domain) {
        case "projects": {
          const raw = storageService.getInitialScopedData("pm_projects_registry", activeUserId, [], workspaceId);
          const projects = Array.isArray(raw) ? raw : [];
          return {
            activeProjectsCount: projects.filter((p) => p.status !== "Completed").length,
            recentProjects: projects.slice(0, 3).map((p) => ({ title: p.title, status: p.status, progress: p.progress })),
          };
        }
        case "learning": {
          const day = Number(storageService.getInitialScopedData("currentDay", activeUserId, 1)) || 1;
          return {
            currentDay: day,
            learningTarget: `Day ${day} AI Engineering Module`,
          };
        }
        case "notes": {
          const raw = storageService.getInitialScopedData("notes_data_list", activeUserId, []);
          const notes = Array.isArray(raw) ? raw : [];
          return {
            totalNotes: notes.length,
            recentTitles: notes.slice(0, 5).map((n) => n.title),
          };
        }
        case "career": {
          const targetRole = storageService.getInitialScopedData("target_career_role", activeUserId, "AI Specialist", workspaceId);
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
  compileContextPrompt: (activeDomain = "dashboard", workspaceId = "default", userId = null) => {
    const sys = contextEngine.getSystemContext(workspaceId, userId);
    const domain = contextEngine.getDomainContext(activeDomain, workspaceId, userId);

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
