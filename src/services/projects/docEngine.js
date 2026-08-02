// =======================================================
// docEngine.js — Project Documentation & Wiki Engine
// =======================================================
// Manages project documentation articles (Overview, Architecture,
// Requirements, Design Docs, Meeting Notes, Research).
// =======================================================

import storageService from "../storageService";

export const DOC_CATEGORIES = ["Overview", "Architecture", "Requirements", "Design Spec", "Meeting Notes", "Research"];

export const docEngine = {
  /** Get all documents for a project */
  getDocs: (projectId) => {
    try {
      const raw = storageService.get(`docs_${projectId}`);
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: `doc_1`,
              projectId,
              title: "System Architecture & Layout Specification",
              category: "Architecture",
              content: "# System Architecture\n\n- Pure CSS variables for independent themes\n- Centralized navigation registry in `config/navigation.js`\n- Single UIContext infrastructure for confirm, loading, context menu.",
              updatedAt: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  },

  /** Save or update a project document */
  saveDoc: (projectId, docData) => {
    const docs = docEngine.getDocs(projectId);
    const exists = docs.some((d) => d.id === docData.id);

    let updated;
    if (exists) {
      updated = docs.map((d) => (d.id === docData.id ? { ...d, ...docData, updatedAt: new Date().toISOString() } : d));
    } else {
      const newDoc = {
        id: `doc_${Date.now()}`,
        projectId,
        title: docData.title || "Untitled Document",
        category: docData.category || "Overview",
        content: docData.content || "",
        updatedAt: new Date().toISOString(),
      };
      updated = [newDoc, ...docs];
    }

    storageService.set(`docs_${projectId}`, JSON.stringify(updated));
    return updated;
  },

  /** Delete a document */
  deleteDoc: (projectId, docId) => {
    const docs = docEngine.getDocs(projectId);
    const updated = docs.filter((d) => d.id !== docId);
    storageService.set(`docs_${projectId}`, JSON.stringify(updated));
    return updated;
  },
};

export default docEngine;
