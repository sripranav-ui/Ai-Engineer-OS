// =======================================================
// portfolioEngine.js — Portfolio Showcase & Projects Engine
// =======================================================
// Manages public portfolio showcase items: projects, blogs,
// certificates, skills, experience, GitHub & demo links.
// =======================================================

import storageService from "../storageService";

const PORTFOLIO_KEY = "career_portfolio_profile";

const DEFAULT_PORTFOLIO = {
  headline: "AI Engineer & Machine Learning Architect",
  bio: "Passionate AI Software Engineer specializing in PyTorch, Transformer models, RAG pipelines, and high-performance vector search.",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  featuredProjects: [
    {
      id: "p1",
      title: "Autonomous RAG Vector Engine",
      description: "Custom vector search index & embedding retrieval backend using Python & PyTorch.",
      tags: ["Python", "PyTorch", "Pinecone", "RAG"],
      github: "https://github.com/example/rag-engine",
      demo: "https://demo.example.com",
    },
    {
      id: "p2",
      title: "AI Engineer OS Core Platform",
      description: "Production-grade AI desktop workspace with unified intelligence and learning engine.",
      tags: ["React", "Vite", "AI Engine", "Architecture"],
      github: "https://github.com/example/ai-engineer-os",
      demo: "https://demo.example.com",
    },
  ],
  skills: ["Python", "PyTorch", "Transformers", "RAG", "FastAPI", "Docker", "Vector DBs", "React"],
};

export const portfolioEngine = {
  /** Get portfolio profile data */
  getPortfolio: () => {
    try {
      const raw = storageService.get(PORTFOLIO_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_PORTFOLIO;
    } catch {
      return DEFAULT_PORTFOLIO;
    }
  },

  /** Update portfolio profile */
  savePortfolio: (data) => {
    const current = portfolioEngine.getPortfolio();
    const next = { ...current, ...data };
    storageService.set(PORTFOLIO_KEY, JSON.stringify(next));
    return next;
  },
};

export default portfolioEngine;
