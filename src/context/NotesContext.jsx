import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import authorization from "../services/auth/authorization.js";
import { PERMISSIONS } from "../services/auth/permissionDefinitions.js";
import storageService from "../services/storageService.js";

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
  const { user } = useContext(AuthContext) || {};
  const userId = user?.id || "guest";

  // --- 1. Folders State (stamped with owner userId) ---
  const [foldersState, setFoldersState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("notes_folders_list", userId, INITIAL_FOLDERS),
  }));

  // --- 2. Notes list State (stamped with owner userId) ---
  const [notesState, setNotesState] = useState(() => ({
    userId,
    data: storageService.getInitialScopedData("notes_data_list", userId, INITIAL_NOTES),
  }));

  // --- Rehydrate when user identity changes ---
  useEffect(() => {
    const freshFolders = storageService.getInitialScopedData("notes_folders_list", userId, INITIAL_FOLDERS);
    const freshNotes = storageService.getInitialScopedData("notes_data_list", userId, INITIAL_NOTES);
    setFoldersState({ userId, data: freshFolders });
    setNotesState({ userId, data: freshNotes });
  }, [userId]);

  // --- Persist scoped state updates ONLY when in-memory state matches active userId ---
  useEffect(() => {
    if (foldersState.userId !== userId) return;
    const key = storageService.getUserKey("notes_folders_list", userId);
    storageService.set(key, JSON.stringify(foldersState.data));
  }, [foldersState, userId]);

  useEffect(() => {
    if (notesState.userId !== userId) return;
    const key = storageService.getUserKey("notes_data_list", userId);
    storageService.set(key, JSON.stringify(notesState.data));
  }, [notesState, userId]);

  const folders = foldersState.userId === userId ? foldersState.data : INITIAL_FOLDERS;
  const notes = notesState.userId === userId ? notesState.data : INITIAL_NOTES;


  // --- Actions ---
  const addNote = (noteData = {}) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_NOTES)) {
      return null;
    }

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

    setNotesState((prev) => ({
      userId,
      data: [newNote, ...(Array.isArray(prev?.data) ? prev.data : [])],
    }));
    return newNote;
  };

  const updateNote = (id, updatedFields) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_NOTES)) {
      return;
    }
    setNotesState((prev) => ({
      userId,
      data: (Array.isArray(prev?.data) ? prev.data : []).map((n) =>
        n.id === id ? { ...n, ...updatedFields, updatedAt: new Date().toISOString() } : n
      ),
    }));
  };

  const deleteNote = (id) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_NOTES)) {
      return;
    }
    setNotesState((prev) => ({
      userId,
      data: (Array.isArray(prev?.data) ? prev.data : []).filter((n) => n.id !== id),
    }));
  };

  const addFolder = (name) => {
    if (!name || !name.trim()) return;
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_NOTES)) {
      return;
    }
    const cleanName = name.trim();
    setFoldersState((prev) => {
      const list = Array.isArray(prev?.data) ? prev.data : INITIAL_FOLDERS;
      return {
        userId,
        data: list.includes(cleanName) ? list : [...list, cleanName],
      };
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
