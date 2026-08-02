// =======================================================
// templateEngine.js — Project Templates Factory
// =======================================================
// Factory to instantiate starter projects pre-populated with
// tasks, milestones, and documentation templates.
// =======================================================

import projectEngine from "./projectEngine";
import taskEngine from "./taskEngine";
import docEngine from "./docEngine";
import timelineEngine from "./timelineEngine";

export const PROJECT_TEMPLATES = [
  {
    id: "template_ai_rag",
    name: "AI RAG System",
    description: "Complete setup for building a Retrieval-Augmented Generation system with Vector DBs.",
    category: "AI & Machine Learning",
    tasks: [
      { title: "Configure Document Ingestion & Chunking Pipeline", status: "todo", priority: "High" },
      { title: "Generate Embeddings using OpenAI / HuggingFace", status: "todo", priority: "High" },
      { title: "Setup Vector DB Index (Chroma/Pinecone)", status: "todo", priority: "Medium" },
      { title: "Implement RAG Retrieval & Prompt Context Injection", status: "todo", priority: "Urgent" },
    ],
    docs: [
      { title: "RAG System Architecture & Strategy", category: "Architecture", content: "# RAG System Architecture\n\n- Ingestion: Chunk size 512, overlap 50\n- Embeddings: text-embedding-3-small\n- Vector DB: Chroma / Pinecone" },
    ],
  },
  {
    id: "template_web_app",
    name: "Full Stack Web Application",
    description: "React + Node/FastAPI production starter with layout shell & auth integration.",
    category: "Web Application",
    tasks: [
      { title: "Design System Tokens & Root CSS Variables", status: "completed", priority: "High" },
      { title: "Implement Auth Routing & Session Provider", status: "todo", priority: "High" },
      { title: "Build Modular Dashboard & Analytics Widgets", status: "todo", priority: "Medium" },
    ],
    docs: [
      { title: "Web App Product Requirements Document", category: "Requirements", content: "# Product Requirements\n\n- Pure CSS design tokens\n- Single source navigation registry\n- Theme toggle support" },
    ],
  },
];

export const templateEngine = {
  /** Get available project templates list */
  getTemplates: () => PROJECT_TEMPLATES,

  /** Create a full project from a template */
  createFromTemplate: (templateId, customTitle, workspaceId = "default") => {
    const tpl = PROJECT_TEMPLATES.find((t) => t.id === templateId) || PROJECT_TEMPLATES[0];

    // 1. Create project entity
    const newProject = projectEngine.createProject(
      {
        title: customTitle || tpl.name,
        description: tpl.description,
        category: tpl.category,
        priority: "High",
      },
      workspaceId
    );

    // 2. Instantiate tasks
    tpl.tasks.forEach((t) => {
      taskEngine.createTask(newProject.id, t, workspaceId);
    });

    // 3. Instantiate docs
    tpl.docs.forEach((d) => {
      docEngine.saveDoc(newProject.id, d);
    });

    // 4. Instantiate default milestones
    timelineEngine.saveMilestone(newProject.id, { title: "Architecture & Spec Review", date: new Date().toISOString().split("T")[0], status: "completed" });
    timelineEngine.saveMilestone(newProject.id, { title: "v1.0 Production Launch", date: new Date(Date.now() + 1209600000).toISOString().split("T")[0], status: "planned" });

    return newProject;
  },
};

export default templateEngine;
