import React, { useState, useEffect } from "react";
import MemoryLayerCard from "./MemoryLayerCard.jsx";
import MemoryTimelineView from "./MemoryTimelineView.jsx";
import MemoryStatsWidget from "./MemoryStatsWidget.jsx";
import EditMemoryModal from "./EditMemoryModal.jsx";
import shortTermMemory from "../../services/ai/memory/shortTermMemory.js";
import longTermMemory from "../../services/ai/memory/longTermMemory.js";
import conversationMemory from "../../services/ai/memory/conversationMemory.js";
import { Database, Search, Clock, Eye } from "lucide-react";
import "./memoryExplorerStyles.css";

export function MemoryExplorerWindow() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "timeline"
  const [stMemory, setStMemory] = useState({});
  const [ltMemory, setLtMemory] = useState({});
  const [conversations, setConversations] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const refreshMemory = () => {
    setStMemory(shortTermMemory.getMemory());
    setLtMemory(longTermMemory.getMemory());
    setConversations(conversationMemory.getAllConversations());
  };

  useEffect(() => {
    refreshMemory();
  }, []);

  const handlePin = (item) => {
    longTermMemory.pinItem(item);
    refreshMemory();
  };

  const handleUnpin = (itemId) => {
    longTermMemory.unpinItem(itemId);
    refreshMemory();
  };

  const handleSaveEdit = (updatedItem) => {
    longTermMemory.pinItem(updatedItem);
    refreshMemory();
  };

  const handleDelete = (itemId) => {
    longTermMemory.unpinItem(itemId);
    refreshMemory();
  };

  // Compile all memory entries
  const memoryEntries = [];

  // 1. Short-Term Memory
  if (stMemory.activePage) {
    memoryEntries.push({ id: "st_active_page", layer: "Short-Term", title: "Active Page Route", text: stMemory.activePage, updatedAt: new Date().toISOString() });
  }

  // 2. Long-Term Memory
  if (ltMemory.pinnedNotes && Array.isArray(ltMemory.pinnedNotes)) {
    ltMemory.pinnedNotes.forEach((p, idx) => {
      memoryEntries.push({ id: p.id || `lt_pinned_${idx}`, layer: "Long-Term", title: p.title || "Pinned Memory", text: p.text || p.value, pinned: true, updatedAt: p.updatedAt });
    });
  }

  // 3. Conversation Memory
  conversations.forEach((conv) => {
    memoryEntries.push({ id: `conv_${conv.id}`, layer: "Conversation", title: conv.title || "Chat Session", text: `${conv.messages?.length || 0} Messages recorded`, updatedAt: conv.updatedAt });
  });

  const filteredEntries = memoryEntries.filter(
    (item) =>
      (activeTab === "all" || String(item.layer || "").toLowerCase().includes(String(activeTab || "").toLowerCase())) &&
      (String(item.title || "").toLowerCase().includes(String(searchQuery || "").toLowerCase()) ||
        (item.text && String(item.text).toLowerCase().includes(String(searchQuery || "").toLowerCase())))
  );

  return (
    <div className="h-full w-full bg-[#05050A] text-slate-100 p-6 overflow-y-auto font-sans relative desktop-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-violet-500/20 border border-indigo-500/35 text-indigo-400 shadow-md shadow-indigo-500/10">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Memory Engine Explorer</h1>
            <p className="text-xs text-slate-400 mt-0.5">Inspect, search, edit, and pin multi-layered memory structures</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "timeline" : "grid")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#090C14] text-xs text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-sm"
          >
            {viewMode === "grid" ? <Clock className="w-3.5 h-3.5 text-indigo-400" /> : <Eye className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{viewMode === "grid" ? "Timeline View" : "Grid View"}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Widget */}
      <MemoryStatsWidget
        shortTermCount={stMemory.activePage ? 1 : 0}
        longTermCount={ltMemory.pinnedNotes?.length || 0}
        pinnedCount={ltMemory.pinnedNotes?.length || 0}
        convCount={conversations.length}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 mt-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory entries..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#090C14] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 desktop-scrollbar">
          {["all", "short-term", "long-term", "conversation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "bg-[#090C14] border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      {viewMode === "grid" ? (
        <div className="memory-grid">
          {filteredEntries.map((item) => (
            <MemoryLayerCard key={item.id} item={item} onPin={handlePin} onUnpin={handleUnpin} onEdit={setEditingItem} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <MemoryTimelineView items={filteredEntries} />
      )}

      {/* Edit Modal */}
      <EditMemoryModal item={editingItem} isOpen={!!editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEdit} />
    </div>
  );
}

export default MemoryExplorerWindow;
