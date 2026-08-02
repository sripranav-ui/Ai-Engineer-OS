import React, { useState, useRef } from "react";
import ConversationSearch from "./ConversationSearch.jsx";
import { MessageSquare, Plus, Pin, Trash2, Download, Upload, Edit2, Check } from "lucide-react";

export function ConversationSidebar({
  conversations = [],
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onPin,
  onDelete,
  onExport,
  onImport,
  onClearAll,
  onSearch,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const fileInputRef = useRef(null);

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    if (onSearch) onSearch(q);
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0 && onImport) {
      onImport(Array.from(files));
    }
    e.target.value = "";
  };

  const startRename = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || "Untitled Conversation");
  };

  const saveRename = (convId) => {
    if (onRename && editTitle.trim()) {
      onRename(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-64 border-r border-white/[0.07] bg-[#0A0D16] p-3.5 flex flex-col h-full shrink-0 select-none">
      <div className="flex items-center gap-2 mb-3.5">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {onImport && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import JSON Conversations"
              className="p-2 rounded-xl bg-[#090C14] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              multiple
              className="hidden"
            />
          </>
        )}
      </div>

      <ConversationSearch value={searchQuery} onChange={handleSearchChange} />

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 desktop-scrollbar mt-3">
        {conversations.map((conv) => {
          const isActive = conv.id === activeId;
          const isEditing = conv.id === editingId;

          return (
            <div
              key={conv.id}
              onClick={() => !isEditing && onSelect(conv.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                isActive
                  ? "bg-indigo-600/20 border border-indigo-500/35 text-indigo-200 font-semibold shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(conv.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => saveRename(conv.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#080A10] border border-indigo-500/50 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full font-sans"
                  />
                ) : (
                  <span className="truncate flex-1">{conv.title || "Untitled Conversation"}</span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {isEditing ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveRename(conv.id);
                    }}
                    title="Save Title"
                    className="p-1 text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                ) : (
                  <>
                    {onRename && (
                      <button
                        onClick={(e) => startRename(e, conv)}
                        title="Rename Conversation"
                        className="p-1 hover:text-indigo-300"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    {onPin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPin(conv.id);
                        }}
                        title={conv.pinned ? "Unpin Conversation" : "Pin Conversation"}
                        className="p-1 hover:text-indigo-400"
                      >
                        <Pin className={`w-3 h-3 ${conv.pinned ? "text-indigo-400 fill-current" : ""}`} />
                      </button>
                    )}
                    {onExport && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExport(conv.id);
                        }}
                        title="Export JSON"
                        className="p-1 hover:text-slate-200"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        title="Delete Conversation"
                        className="p-1 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {onClearAll && (
        <div className="pt-2 border-t border-white/[0.07] mt-2">
          <button
            onClick={onClearAll}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-white/5 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[11px] font-semibold transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ConversationSidebar;
