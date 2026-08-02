// =======================================================
// bookmarkEngine.js — Global Cross-Module Bookmark Engine
// =======================================================
// Allows bookmarking lessons, projects, notes, videos,
// articles, and roadmaps synced across storage.
// =======================================================

import storageService from "../storageService";

const BOOKMARKS_KEY = "global_user_bookmarks";

export const bookmarkEngine = {
  /** Get all user bookmarks */
  getBookmarks: () => {
    try {
      const raw = storageService.get(BOOKMARKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Check if item is bookmarked */
  isBookmarked: (itemId) => {
    const list = bookmarkEngine.getBookmarks();
    return list.some((b) => b.id === itemId);
  },

  /** Toggle bookmark on any item type */
  toggleBookmark: (item) => {
    const list = bookmarkEngine.getBookmarks();
    const exists = list.some((b) => b.id === item.id);

    let updated;
    if (exists) {
      updated = list.filter((b) => b.id !== item.id);
    } else {
      const newBookmark = {
        id: item.id,
        title: item.title,
        type: item.type || "Lesson", // "Lesson" | "Project" | "Note" | "Roadmap" | "Article"
        path: item.path || "/learning",
        timestamp: new Date().toISOString(),
      };
      updated = [newBookmark, ...list];
    }

    storageService.set(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  },

  /** Get bookmarks filtered by type */
  getByType: (type) => {
    const list = bookmarkEngine.getBookmarks();
    return list.filter((b) => b.type === type);
  },
};

export default bookmarkEngine;
