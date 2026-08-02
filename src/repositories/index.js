import UserRepository from "./UserRepository";
import ProjectRepository from "./ProjectRepository";
import LessonRepository from "./LessonRepository";
import CertificateRepository from "./CertificateRepository";
import PlannerRepository from "./PlannerRepository";
import AnalyticsRepository from "./AnalyticsRepository";
import AIRepository from "./AIRepository";
import NotificationRepository from "./NotificationRepository";
import RoadmapRepository from "./RoadmapRepository";
import WorkspaceRepository from "./WorkspaceRepository";
import SettingsRepository from "./SettingsRepository";

// Registry store holding the active repository strategy overrides
const registry = {
  UserRepository,
  ProjectRepository,
  LessonRepository,
  CertificateRepository,
  PlannerRepository,
  AnalyticsRepository,
  AIRepository,
  NotificationRepository,
  RoadmapRepository,
  WorkspaceRepository,
  SettingsRepository
};

/**
 * Dependency Injection (DI) Container for Repository Layer
 */
export const repositories = {
  get: (name) => {
    return registry[name];
  },

  /**
   * Overrides repository dependencies at runtime (DI Ready)
   */
  register: (name, implementation) => {
    registry[name] = implementation;
  },

  // Provide direct shorthand properties references
  user: () => registry.UserRepository,
  projects: () => registry.ProjectRepository,
  lessons: () => registry.LessonRepository,
  certificates: () => registry.CertificateRepository,
  planner: () => registry.PlannerRepository,
  analytics: () => registry.AnalyticsRepository,
  ai: () => registry.AIRepository,
  notifications: () => registry.NotificationRepository,
  roadmap: () => registry.RoadmapRepository,
  workspaces: () => registry.WorkspaceRepository,
  settings: () => registry.SettingsRepository,
};

export default repositories;
