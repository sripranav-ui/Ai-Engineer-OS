import React, { createContext, useState, useEffect } from "react";

// =======================================================
// NotesContext.jsx
// Notion-style local storage notes manager context provider
// Resilient Array Guarding for LocalStorage State
// =======================================================

export const NotesContext = createContext();

const INITIAL_FOLDERS = ["General", "AI Engineering", "Job Prep"];

const INITIAL_NOTES = [
  {
    id: 1,
    title: "Decorators in Python",
    content: "# Python Decorators Cheat-Sheet\n\nDecorators wrap functions utilizing closures to extend behaviors dynamically:\n\n```python\ndef my_decorator(func):\n    def wrapper(*args, **kwargs):\n        print('Before execution')\n        result = func(*args, **kwargs)\n        print('After execution')\n        return result\n    return wrapper\n```\n\nUse `@my_decorator` prefix above helper definitions to implement.",
    folder: "AI Engineering",
    tags: ["python", "closures"],
    pinned: true,
    favorite: true,
    updatedAt: "2026-07-18T14:32:00Z",
  },
  {
    id: 2,
    title: "SQL Offset Queries",
    content: "# SQL Second Highest Salary query\n\n```sql\nSELECT MAX(Salary)\nFROM Employee\nWHERE Salary < (SELECT MAX(Salary) FROM Employee);\n```\n\nAlternatively, order descending and skip the first item:\n\n`SELECT Salary FROM Employee ORDER BY Salary DESC LIMIT 1 OFFSET 1;`",
    folder: "Job Prep",
    tags: ["sql", "database"],
    pinned: false,
    favorite: true,
    updatedAt: "2026-07-19T09:12:00Z",
  },
];

export function NotesProvider({ children }) {
  // --- 1. Folders ---
  const [folders, setFolders] = useState(() => {
    try {
      const saved = localStorage.getItem("notes_folders_list");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FOLDERS;
    } catch {
      return INITIAL_FOLDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem("notes_folders_list", JSON.stringify(folders));
  }, [folders]);

  // --- 2. Notes list ---
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("notes_data_list");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  useEffect(() => {
    localStorage.setItem("notes_data_list", JSON.stringify(notes));
  }, [notes]);

  // --- Actions ---
  const addNote = (noteData = {}) => {
    const title = noteData.title || "Untitled Note";
    const content = noteData.content || "";
    const folder = noteData.folder || "General";
    const tags = Array.isArray(noteData.tags) ? noteData.tags : ["general"];

    const newNote = {
      id: Date.now(),
      title,
      content,
      folder,
      tags,
      pinned: false,
      favorite: false,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...(Array.isArray(prev) ? prev : [])]);
    return newNote;
  };

  const updateNote = (id, updatedFields) => {
    setNotes((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) => (n.id === id ? { ...n, ...updatedFields, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => (Array.isArray(prev) ? prev : []).filter((n) => n.id !== id));
  };

  const addFolder = (name) => {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    setFolders((prev) => {
      const list = Array.isArray(prev) ? prev : INITIAL_FOLDERS;
      return list.includes(cleanName) ? list : [...list, cleanName];
    });
  };

  return (
    <NotesContext.Provider
      value={{
        folders: Array.isArray(folders) ? folders : INITIAL_FOLDERS,
        notes: Array.isArray(notes) ? notes : INITIAL_NOTES,
        addNote,
        updateNote,
        deleteNote,
        addFolder,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export default NotesProvider;
