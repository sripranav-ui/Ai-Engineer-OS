// =======================================================
// projectController.js — Project & Task REST API Controller
// =======================================================

import { sendSuccess } from "../utils/response.js";

const MOCK_PROJECTS = [
  { id: "proj_1", title: "AI Engineer OS Core Platform", status: "Active", priority: "Urgent", progress: 75 },
  { id: "proj_2", title: "Autonomous RAG Vector Engine", status: "Planning", priority: "High", progress: 30 },
];

export const getProjects = async (req, res, next) => {
  try {
    return sendSuccess(res, "Projects retrieved successfully", MOCK_PROJECTS);
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    const newProj = {
      id: `proj_${Date.now()}`,
      title: title || "New Project",
      description: description || "",
      category: category || "AI & Machine Learning",
      status: "Planning",
      priority: priority || "Medium",
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    MOCK_PROJECTS.unshift(newProj);
    return sendSuccess(res, "Project created successfully", newProj, 201);
  } catch (err) {
    next(err);
  }
};

export default { getProjects, createProject };
