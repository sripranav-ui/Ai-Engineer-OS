import React, { useState, useContext, useMemo } from "react";
import { NotesContext } from "../context/NotesContext";
import useDocumentMetadata from "../hooks/useDocumentMetadata";
import { FileText, Plus, Search, Trash2 } from "lucide-react";

// =======================================================
// NotesPage.jsx — Notion-Style Minimal Markdown Workspace
// =======================================================

function NotesPage() {
  useDocumentMetadata("Notes & Vault", "Notion-style markdown notes workspace.");

  const { notes, addNote, updateNote, deleteNote } = useContext(NotesContext);
  const safeNotes = useMemo(() => (Array.isArray(notes) ? notes : []), [notes]);
  const [activeNoteId, setActiveNoteId] = useState(safeNotes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeNote = useMemo(() => {
    return safeNotes.find((n) => n && n.id === activeNoteId) || safeNotes[0] || null;
  }, [safeNotes, activeNoteId]);

  const handleCreateNote = () => {
    const newNote = addNote({
      title: "Untitled Note",
      content: "# New Note\n\nStart typing markdown content here...",
      tags: ["general"],
    });
    if (newNote) setActiveNoteId(newNote.id);
  };

  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 flex overflow-hidden font-sans select-none">
      {/* Left Note Directory Drawer */}
      <div className="w-64 bg-[#050508] border-r border-white/[0.04] p-3 flex flex-col h-full shrink-0">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.04]">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Notes Vault</span>
          <button
            onClick={handleCreateNote}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mb-3 px-1">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e0e14] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500 font-sans"
          />
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto v2-scrollbar">
          {safeNotes
            .filter((n) => n && n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((note) => {
              const isActive = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="truncate">{note.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Notion-Style Editor Canvas */}
      <div className="flex-1 flex flex-col h-full bg-[#050508] p-8 overflow-y-auto v2-scrollbar">
        {activeNote ? (
          <div className="max-w-3xl mx-auto w-full space-y-4">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
              className="w-full bg-transparent text-2xl font-bold text-white outline-none font-sans tracking-tight"
            />
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              className="w-full h-[600px] bg-transparent text-slate-200 font-mono text-xs outline-none resize-none leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-xs">
            No note selected. Create a new note to start writing.
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(NotesPage);
