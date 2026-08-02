// =======================================================
// searchEngine.js — Unified Fuzzy Learning Search Engine
// Guarded String Casting on All Search Targets
// =======================================================

import storageService from "../storageService";
import roadmapEngine from "./roadmapEngine";
import flashcardEngine from "./flashcardEngine";
import bookmarkEngine from "./bookmarkEngine";

export const searchEngine = {
  /**
   * Search across all learning artifacts
   * @param {string} query - search query text
   * @param {string} [categoryFilter] - "All" | "Lesson" | "Note" | "Flashcard" | "Project"
   */
  searchAll: (query = "", categoryFilter = "All") => {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const results = [];

    // 1. Lessons & Roadmaps
    try {
      const tracks = roadmapEngine.getTracks() || [];
      tracks.forEach((track) => {
        const modules = Array.isArray(track?.modules) ? track.modules : [];
        modules.forEach((mod) => {
          const lessons = Array.isArray(mod?.lessons) ? mod.lessons : [];
          lessons.forEach((l) => {
            const topic = String(l?.topic || "").toLowerCase();
            if (topic.includes(q)) {
              results.push({
                id: `lesson_${l.id}`,
                title: `📖 Lesson: ${l.topic || "Untitled Lesson"}`,
                category: "Lesson",
                path: "/learning",
                snippet: `Module: ${mod.title || "Module"} • Est: ${l.estMinutes || 10} mins`,
              });
            }
          });
        });
      });
    } catch {}

    // 2. Notes
    try {
      const rawNotes = storageService.get("knowledge_notes");
      const notes = rawNotes ? JSON.parse(rawNotes) : [];
      const safeNotes = Array.isArray(notes) ? notes : [];
      safeNotes.forEach((n) => {
        const title = String(n?.title || "").toLowerCase();
        const content = String(n?.content || "").toLowerCase();
        if (title.includes(q) || content.includes(q)) {
          results.push({
            id: n.id,
            title: `📓 Note: ${n.title || "Untitled Note"}`,
            category: "Note",
            path: "/knowledge",
            snippet: n.content ? String(n.content).slice(0, 80) + "..." : "",
          });
        }
      });
    } catch {}

    // 3. Flashcards
    try {
      const flashcards = flashcardEngine.getDeck() || [];
      const safeCards = Array.isArray(flashcards) ? flashcards : [];
      safeCards.forEach((fc) => {
        const question = String(fc?.question || "").toLowerCase();
        const answer = String(fc?.answer || "").toLowerCase();
        if (question.includes(q) || answer.includes(q)) {
          results.push({
            id: fc.id,
            title: `🎴 Flashcard: ${String(fc.question || "").slice(0, 45)}...`,
            category: "Flashcard",
            path: "/learning",
            snippet: String(fc.answer || "").slice(0, 80),
          });
        }
      });
    } catch {}

    // Filter by category if requested
    if (categoryFilter !== "All") {
      return results.filter((r) => r.category === categoryFilter);
    }

    return results.slice(0, 10);
  },
};

export default searchEngine;
