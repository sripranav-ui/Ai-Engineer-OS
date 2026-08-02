// =======================================================
// applicationEngine.js — Job Application Tracker Engine
// =======================================================
// Manages job application pipeline states, salary tracking,
// application dates, required skills, and status updates.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

const APPLICATIONS_KEY = "career_applications_pipeline";

export const APPLICATION_STATUSES = ["Wishlist", "Applied", "Interviewing", "Offer Received", "Rejected"];

const DEFAULT_APPLICATIONS = [
  {
    id: "app_1",
    role: "Associate AI Engineer",
    company: "Synthetix AI",
    location: "San Francisco, CA (Hybrid)",
    salary: "$120,000",
    status: "Interviewing",
    date: "2026-07-12",
    requiredSkills: ["Python", "PyTorch", "RAG", "FastAPI"],
  },
  {
    id: "app_2",
    role: "Junior ML Developer",
    company: "Cognitive Solutions",
    location: "Remote",
    salary: "$105,000",
    status: "Applied",
    date: "2026-07-16",
    requiredSkills: ["Python", "Scikit-Learn", "NumPy"],
  },
  {
    id: "app_3",
    role: "Python Backend Developer (AI Team)",
    company: "AlphaScale Labs",
    location: "Austin, TX (On-site)",
    salary: "$115,000",
    status: "Offer Received",
    date: "2026-07-08",
    requiredSkills: ["Python", "API", "Docker"],
  },
];

export const applicationEngine = {
  /** Get all applications in pipeline */
  getApplications: () => {
    try {
      const raw = storageService.get(APPLICATIONS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_APPLICATIONS;
    } catch {
      return DEFAULT_APPLICATIONS;
    }
  },

  /** Save applications list */
  saveApplications: (list) => {
    try {
      storageService.set(APPLICATIONS_KEY, JSON.stringify(list));
    } catch (err) {
      logger.error("[ApplicationEngine] Error saving applications:", err);
    }
  },

  /** Add new application */
  addApplication: (data) => {
    const list = applicationEngine.getApplications();
    const newApp = {
      id: `app_${Date.now()}`,
      role: data.role || "AI Engineer",
      company: data.company || "Company",
      location: data.location || "Remote",
      salary: data.salary || "$115,000",
      status: data.status || "Applied",
      date: new Date().toISOString().split("T")[0],
      requiredSkills: data.requiredSkills || ["Python"],
    };
    const updated = [newApp, ...list];
    applicationEngine.saveApplications(updated);
    return newApp;
  },

  /** Update application status */
  updateStatus: (appId, nextStatus) => {
    const list = applicationEngine.getApplications();
    const updated = list.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a));
    applicationEngine.saveApplications(updated);
    return updated;
  },
};

export default applicationEngine;
