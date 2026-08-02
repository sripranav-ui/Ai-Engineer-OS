// =======================================================
// resumeEngine.js — Resume Builder & ATS Optimization Engine
// =======================================================
// Manages multiple resumes, versioning, Markdown content,
// ATS keyword score calculation, and keyword density checks.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

const RESUMES_STORAGE_KEY = "career_resumes_list";

const DEFAULT_RESUMES = [
  {
    id: "res_1",
    title: "AI Engineer Resume - Core",
    version: "v1.2",
    updatedAt: "2026-07-20",
    active: true,
    atsScore: 92,
    summary: "Senior AI Engineer with expertise in PyTorch, LLM orchestration, RAG architectures, and high-performance vector search.",
    skills: ["Python", "PyTorch", "Transformers", "RAG", "FastAPI", "Docker", "Vector DBs"],
  },
  {
    id: "res_2",
    title: "ML Developer Resume - Core ML",
    version: "v1.0",
    updatedAt: "2026-07-15",
    active: false,
    atsScore: 84,
    summary: "Machine Learning Engineer focused on regression, classification models, and neural network optimization.",
    skills: ["Python", "Scikit-Learn", "NumPy", "Pandas", "PyTorch"],
  },
];

export const resumeEngine = {
  /** Get all resumes */
  getResumes: () => {
    try {
      const raw = storageService.get(RESUMES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_RESUMES;
    } catch {
      return DEFAULT_RESUMES;
    }
  },

  /** Save resumes list */
  saveResumes: (list) => {
    try {
      storageService.set(RESUMES_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      logger.error("[ResumeEngine] Error saving resumes:", err);
    }
  },

  /** Calculate ATS Keyword Match Score (0 - 100) */
  calculateATSScore: (resumeText = "", targetKeywords = ["Python", "PyTorch", "LLM", "RAG", "API"]) => {
    if (!resumeText.trim()) return 0;
    const textLower = resumeText.toLowerCase();
    let matches = 0;

    targetKeywords.forEach((kw) => {
      if (textLower.includes(kw.toLowerCase())) matches++;
    });

    return Math.min(100, Math.round((matches / targetKeywords.length) * 100));
  },

  /** Create new resume version */
  createResume: (data) => {
    const list = resumeEngine.getResumes();
    const newRes = {
      id: `res_${Date.now()}`,
      title: data.title || "New AI Resume",
      version: data.version || "v1.0",
      updatedAt: new Date().toISOString().split("T")[0],
      active: list.length === 0,
      atsScore: resumeEngine.calculateATSScore(data.summary || ""),
      summary: data.summary || "",
      skills: data.skills || ["Python", "AI"],
    };

    const updated = [newRes, ...list];
    resumeEngine.saveResumes(updated);
    return newRes;
  },

  /** Set active resume */
  setActive: (resumeId) => {
    const list = resumeEngine.getResumes();
    const updated = list.map((r) => ({ ...r, active: r.id === resumeId }));
    resumeEngine.saveResumes(updated);
    return updated;
  },
};

export default resumeEngine;
