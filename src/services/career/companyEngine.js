// =======================================================
// companyEngine.js — Dream Company Tracker Engine
// =======================================================
// Tracks target dream companies, target roles, application
// status, salary expectations, and research notes.
// =======================================================

import storageService from "../storageService";

const COMPANIES_KEY = "career_dream_companies";

const DEFAULT_COMPANIES = [
  { id: "c1", name: "OpenAI", role: "AI Research Engineer", targetDate: "Dec 2026", status: "Preparing", salaryRange: "$180k - $250k" },
  { id: "c2", name: "Anthropic", role: "ML Infrastructure Lead", targetDate: "Oct 2026", status: "Targeting", salaryRange: "$190k - $260k" },
  { id: "c3", name: "Google DeepMind", role: "AI Resident", targetDate: "July 2027", status: "Researching", salaryRange: "$170k - $220k" },
];

export const companyEngine = {
  /** Get all dream companies */
  getCompanies: () => {
    try {
      const raw = storageService.get(COMPANIES_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_COMPANIES;
    } catch {
      return DEFAULT_COMPANIES;
    }
  },

  /** Add dream company */
  addCompany: (data) => {
    const list = companyEngine.getCompanies();
    const newComp = {
      id: `c_${Date.now()}`,
      name: data.name || "Target Company",
      role: data.role || "AI Engineer",
      targetDate: data.targetDate || "Dec 2026",
      status: data.status || "Targeting",
      salaryRange: data.salaryRange || "$150k - $200k",
    };
    const updated = [newComp, ...list];
    storageService.set(COMPANIES_KEY, JSON.stringify(updated));
    return newComp;
  },
};

export default companyEngine;
