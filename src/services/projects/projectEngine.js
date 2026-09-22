// =======================================================
// projectEngine.js — Core Project Lifecycle Management
// =======================================================
// Manages project entities, categories, status, priorities,
// tags, deadlines, favorites, archiving, and workspace isolation.
// =======================================================

import storageService from "../storageService.js";
import logger from "../../utils/logger.js";

const PROJECTS_STORAGE_KEY = "pm_projects_registry";

export const PROJECT_CATEGORIES = ["AI & Machine Learning", "Web Application", "Mobile App", "System Architecture", "Open Source"];
export const PROJECT_STATUSES   = ["Planning", "Active", "In Review", "Completed", "Archived"];
export const PROJECT_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const DEFAULT_PROJECTS = [
  {
    id: "proj_1",
    title: "AI Engineer OS Core Platform",
    description: "Production-grade AI desktop workspace with unified intelligence and learning engine.",
    category: "AI & Machine Learning",
    status: "Active",
    priority: "Urgent",
    tags: ["React", "AI", "Vite", "Architecture"],
    progress: 75,
    favorite: true,
    archived: false,
    deadline: "2026-08-31",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj_2",
    title: "Autonomous RAG Vector Engine",
    description: "Custom vector search index & embedding retrieval backend using Python & PyTorch.",
    category: "AI & Machine Learning",
    status: "Planning",
    priority: "High",
    tags: ["Python", "PyTorch", "Pinecone", "RAG"],
    progress: 30,
    favorite: false,
    archived: false,
    deadline: "2026-09-15",
    createdAt: new Date(Date.now() - 302400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const projectEngine = {
  /** Get all active projects for workspace */
  getProjects: (workspaceId = "default", userId = null) => {
    if (!userId) {
      logger.warn("[ProjectEngine] getProjects called without explicit userId.");
      return DEFAULT_PROJECTS;
    }
    try {
      const key = storageService.getScopedKey(PROJECTS_STORAGE_KEY, userId, workspaceId);
      const raw = storageService.get(key);
      return raw ? JSON.parse(raw) : DEFAULT_PROJECTS;
    } catch {
      return DEFAULT_PROJECTS;
    }
  },

  /** Save projects list */
  saveProjects: (projects, workspaceId = "default", userId = null) => {
    if (!userId) {
      throw new Error("[ProjectEngine] Cannot save projects without an explicit userId.");
    }
    try {
      const key = storageService.getScopedKey(PROJECTS_STORAGE_KEY, userId, workspaceId);
      storageService.set(key, JSON.stringify(projects));
    } catch (err) {
      logger.error("[ProjectEngine] Error saving projects:", err);
      throw err;
    }
  },

  /** Create new project */
  createProject: (data, workspaceId = "default", userId = null) => {
    if (!userId) {
      throw new Error("[ProjectEngine] Cannot create project without an explicit userId.");
    }
    const list = projectEngine.getProjects(workspaceId, userId);
    const newProj = {
      id: `proj_${Date.now()}`,
      title: data.title || "Untitled Project",
      description: data.description || "",
      category: data.category || "AI & Machine Learning",
      status: data.status || "Planning",
      priority: data.priority || "Medium",
      tags: data.tags || [],
      progress: 0,
      favorite: false,
      archived: false,
      deadline: data.deadline || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProj, ...list];
    projectEngine.saveProjects(updated, workspaceId, userId);
    logger.info(`[ProjectEngine] Created project "${newProj.title}".`);
    return newProj;
  },

  /** Toggle favorite status */
  toggleFavorite: (projectId, workspaceId = "default", userId = null) => {
    if (!userId) {
      throw new Error("[ProjectEngine] Cannot toggle favorite without an explicit userId.");
    }
    const list = projectEngine.getProjects(workspaceId, userId);
    const updated = list.map((p) => (p.id === projectId ? { ...p, favorite: !p.favorite } : p));
    projectEngine.saveProjects(updated, workspaceId, userId);
    return updated;
  },

  /** Archive or restore project */
  toggleArchive: (projectId, workspaceId = "default", userId = null) => {
    if (!userId) {
      throw new Error("[ProjectEngine] Cannot toggle archive without an explicit userId.");
    }
    const list = projectEngine.getProjects(workspaceId, userId);
    const updated = list.map((p) => (p.id === projectId ? { ...p, archived: !p.archived, status: !p.archived ? "Archived" : "Active" } : p));
    projectEngine.saveProjects(updated, workspaceId, userId);
    return updated;
  },
};

export default projectEngine;
