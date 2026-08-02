// =======================================================
// roadmapEngine.js — Adaptive Roadmap Architecture
// =======================================================
// Manages multi-track learning roadmaps, nested modules,
// topics, milestones, prerequisites/dependencies, and progress.
// =======================================================

import storageService from "../storageService";
import logger from "../../utils/logger";

export const ROADMAP_TRACKS = [
  {
    id: "ai-engineering",
    title: "AI Engineering Mastery",
    description: "From Python & Math fundamentals to LLM fine-tuning, RAG, and multi-agent systems.",
    difficulty: "Intermediate",
    estimatedHours: 120,
    modules: [
      {
        id: "m1",
        title: "Module 1: Foundations & Python Ecosystem",
        description: "NumPy, Pandas, Vectorization, and linear algebra fundamentals.",
        lessons: [
          { id: 1, topic: "Python for AI & NumPy Matrix Operations", estMinutes: 90, difficulty: "Beginner", completed: true },
          { id: 2, topic: "Linear Algebra: Tensors, Matrix Multiplication & Eigenvalues", estMinutes: 120, difficulty: "Intermediate", completed: true },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Machine Learning Core Algorithms",
        description: "Regression, Classification, Decision Trees, and Gradient Descent.",
        lessons: [
          { id: 3, topic: "Supervised Learning: Gradient Descent & Loss Functions", estMinutes: 105, difficulty: "Intermediate", completed: true },
          { id: 4, topic: "Neural Networks: Backpropagation & PyTorch Autograd", estMinutes: 150, difficulty: "Advanced", completed: false },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Transformers & Modern LLM Architecture",
        description: "Attention mechanism, Transformer blocks, and tokenization.",
        lessons: [
          { id: 5, topic: "Self-Attention Mechanism & Multi-Head Attention", estMinutes: 180, difficulty: "Advanced", completed: false },
          { id: 6, topic: "RAG Systems & Vector Databases (Pinecone/Chroma)", estMinutes: 140, difficulty: "Advanced", completed: false },
        ],
      },
    ],
  },
  {
    id: "mlops-production",
    title: "MLOps & LLM Systems Production",
    description: "Model deployment, Docker, FastAPI, vLLM, LangSmith, and evaluation pipelines.",
    difficulty: "Advanced",
    estimatedHours: 85,
    modules: [
      {
        id: "m1_ops",
        title: "Module 1: Inference Acceleration & API Serving",
        description: "Serving models with vLLM, TensorRT-LLM, and FastAPI.",
        lessons: [
          { id: 101, topic: "FastAPI & vLLM High-Throughput Inference", estMinutes: 120, difficulty: "Advanced", completed: false },
        ],
      },
    ],
  },
];

export const roadmapEngine = {
  /** Get all available roadmap tracks */
  getTracks: () => ROADMAP_TRACKS,

  /** Get specific track by ID */
  getTrack: (trackId) => ROADMAP_TRACKS.find((t) => t.id === trackId) || ROADMAP_TRACKS[0],

  /** Get user progress per track */
  getTrackProgress: (trackId = "ai-engineering") => {
    const track = roadmapEngine.getTrack(trackId);
    let total = 0;
    let completed = 0;

    track.modules.forEach((mod) => {
      mod.lessons.forEach((l) => {
        total++;
        if (l.completed) completed++;
      });
    });

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  },

  /** Toggle lesson completion status */
  toggleLessonCompletion: (trackId, lessonId) => {
    const raw = storageService.get(`roadmap_progress_${trackId}`);
    const completedSet = new Set(raw ? JSON.parse(raw) : [1, 2, 3]);

    if (completedSet.has(lessonId)) {
      completedSet.delete(lessonId);
    } else {
      completedSet.add(lessonId);
    }

    storageService.set(`roadmap_progress_${trackId}`, JSON.stringify(Array.from(completedSet)));
    logger.info(`[RoadmapEngine] Toggled lesson ${lessonId} on track ${trackId}`);
    return Array.from(completedSet);
  },
};

export default roadmapEngine;
