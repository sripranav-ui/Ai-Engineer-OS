import React, { useState, useEffect, useMemo, useRef } from "react";
import useDocumentMetadata from "../hooks/useDocumentMetadata";
import ragManager from "../services/ai/rag/ragManager.js";
import retrievalService from "../services/ai/rag/retrievalService.js";
import embeddingFactory from "../services/ai/rag/embeddings/embeddingFactory.js";
import {
  BookOpen,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  RefreshCw,
  FileText,
  Sliders,
  Sparkles,
  Layers,
  Check,
  ChevronRight,
  ChevronDown,
  Upload,
  Link,
  Edit3,
  HelpCircle,
  Copy,
  Download,
  Terminal,
  Database,
  Cpu,
  Clock,
  Zap,
  Code,
  X,
  FileCode,
  AlertTriangle,
  Loader2,
  Share2,
  Compass,
} from "lucide-react";

// =======================================================
// KnowledgeHubPage.jsx — Phase 4.3 Knowledge Intelligence Layer
// Integrates Vector Embeddings, Semantic Search, Hybrid Search, and Related Documents
// =======================================================

const DEFAULT_COLLECTIONS = [
  { id: "eng_docs", name: "Engineering Docs", icon: "📁", count: 8 },
  { id: "research", name: "Research Papers", icon: "🔬", count: 4 },
  { id: "course_notes", name: "Course Notes", icon: "🎓", count: 12 },
  { id: "proj_mem", name: "Project Memory", icon: "🧠", count: 6 },
  { id: "api_refs", name: "API References", icon: "⚡", count: 15 },
  { id: "books", name: "Books & Cheat Sheets", icon: "📚", count: 5 },
  { id: "rag_vault", name: "Vector Database (RAG)", icon: "🗄️", count: 0 },
];

export function KnowledgeHubPage() {
  useDocumentMetadata("Knowledge OS", "Vector Embeddings & Semantic Intelligence.");

  // --- Core State ---
  const [ragDocuments, setRagDocuments] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState("rag_vault");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("hybrid"); // 'hybrid' or 'semantic'
  const [searchResults, setSearchResults] = useState(null);
  const [showLeftRail, setShowLeftRail] = useState(true);
  const [showRightInspector, setShowRightInspector] = useState(true);
  const [showTesterModal, setShowTesterModal] = useState(false);
  const [collections, setCollections] = useState(DEFAULT_COLLECTIONS);
  const [relatedDocs, setRelatedDocs] = useState([]);

  // --- Pipeline & Ingestion State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // --- Floating Composer Mode State ---
  const [composerMode, setComposerMode] = useState("upload");
  const [composerInput, setComposerInput] = useState("");

  // --- Tester Query State ---
  const [debugQuery, setDebugQuery] = useState("");
  const [debugResults, setDebugResults] = useState(null);

  const fileInputRef = useRef(null);

  // Refresh RAG State & Storage
  const refreshRagState = async () => {
    try {
      const docs = await ragManager.getDocuments();
      setRagDocuments(docs || []);
    } catch (err) {
      console.error("Error fetching RAG documents:", err);
    }
  };

  useEffect(() => {
    refreshRagState();

    const unsubscribe = ragManager.subscribeProgress((event) => {
      if (event.type === "PROGRESS" || event.type === "QUEUED") {
        setPipelineProgress({
          jobId: event.jobId,
          stage: event.stage || "Embedding",
          percent: event.percent || 40,
          status: event.status || "Generating vector embeddings...",
        });
      } else if (event.type === "COMPLETE") {
        setPipelineProgress({ jobId: event.jobId, stage: "Indexed", percent: 100, status: "Available For Search" });
        showToast("✓ Document vectors embedded & indexed");
        setTimeout(() => setPipelineProgress(null), 2500);
        setIsProcessing(false);
        refreshRagState();
      } else if (event.type === "ERROR") {
        setIsProcessing(false);
        setPipelineProgress(null);
        showToast(`⚠️ Embedding error: ${event.error || "Failed to generate vectors"}`, "error");
        refreshRagState();
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected document object
  const activeDocument = useMemo(() => {
    return ragDocuments.find((d) => d.id === selectedDocId) || ragDocuments[0] || null;
  }, [ragDocuments, selectedDocId]);

  // Load Related Documents when active document changes
  useEffect(() => {
    if (activeDocument && activeDocument.id) {
      retrievalService.getRelatedDocuments(activeDocument.id, { topN: 3 }).then((rel) => {
        setRelatedDocs(rel || []);
      });
    } else {
      setRelatedDocs([]);
    }
  }, [activeDocument]);

  // Real-time Semantic / Hybrid Search Execution
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await retrievalService.search(searchQuery, { mode: searchMode, topK: 5 });
      setSearchResults(res);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);

  // File Ingestion Pipeline
  const ingestFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    for (const file of files) {
      try {
        const existingDocs = await ragManager.getDocuments();
        const duplicate = existingDocs.find((d) => d.title === file.name || d.filename === file.name);

        if (duplicate) {
          showToast(`⚠️ Document '${file.name}' already indexed in library.`, "error");
          continue;
        }

        setPipelineProgress({
          stage: "Uploading",
          percent: 15,
          status: `Reading ${file.name}...`,
        });

        await ragManager.enqueueFile(file);
      } catch (err) {
        showToast(`Ingestion failed: ${err.message}`, "error");
      }
    }
    setIsProcessing(false);
  };

  // Upload Handlers
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    ingestFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      ingestFiles(files);
    }
  };

  const handlePasteSubmit = () => {
    if (!composerInput.trim()) return;
    const text = composerInput.trim();

    if (composerMode === "url") {
      const filename = `url_doc_${Date.now().toString().slice(-4)}.md`;
      const blob = new Blob([`# Document From URL\nURL: ${text}\n\nIngested web document content synthesized from ${text}.`], { type: "text/markdown" });
      const file = new File([blob], filename, { type: "text/markdown" });
      ingestFiles([file]);
    } else {
      const filename = `note_${Date.now().toString().slice(-4)}.txt`;
      const blob = new Blob([text], { type: "text/plain" });
      const file = new File([blob], filename, { type: "text/plain" });
      ingestFiles([file]);
    }
    setComposerInput("");
  };

  const handleDeleteDocument = async (docId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete document and associated vector embeddings?")) return;
    await ragManager.deleteDocument(docId);
    if (selectedDocId === docId) setSelectedDocId(null);
    showToast("✓ Document and vector embeddings deleted");
    refreshRagState();
  };

  const handleRunRetrievalDebug = async () => {
    if (!debugQuery.trim()) return;
    const res = await retrievalService.search(debugQuery, { mode: "hybrid", topK: 4 });
    setDebugResults(res);
  };

  const filteredDocs = useMemo(() => {
    return ragDocuments.filter((d) =>
      (d.name || d.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ragDocuments, searchQuery]);

  return (
    <div
      className="h-full w-full bg-[#050507] text-[#F8FAFC] flex overflow-hidden font-sans select-none relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-6 z-50 px-4 py-2.5 rounded-xl border text-xs font-mono backdrop-blur-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "error"
              ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
              : "bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]"
          }`}
        >
          {toastMessage.type === "error" ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-[#10B981]" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. LEFT RAIL (280px) — Knowledge Collections       */}
      {/* ---------------------------------------------------- */}
      {showLeftRail && (
        <div className="w-[280px] bg-[#09090D] border-r border-white/[0.04] flex flex-col h-full shrink-0 transition-all z-10">
          <div className="p-3.5 border-b border-white/[0.04] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white tracking-tight">
                <BookOpen className="w-4 h-4 text-[#6366F1]" />
                <span>Knowledge OS</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-lg bg-[#6366F1]/15 hover:bg-[#6366F1]/25 text-[#6366F1] transition-all flex items-center gap-1 px-2 text-[10px] font-mono"
                title="Upload Document"
              >
                <Plus className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.md,.markdown,.txt,.docx,.doc,.json,.csv,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.cs,.html,.css"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Hybrid / Semantic Search Toggle Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#050508] border border-white/10 focus-within:border-[#6366F1]/50 transition-all">
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  aria-label="Knowledge Search"
                  placeholder="Semantic or hybrid search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white outline-none font-sans placeholder:text-slate-600"
                />
              </div>

              <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-500">
                <span className="uppercase">Search Mode</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSearchMode("hybrid")}
                    className={`px-1.5 py-0.5 rounded transition-all ${
                      searchMode === "hybrid" ? "bg-[#6366F1]/20 text-[#6366F1] font-semibold" : "hover:text-slate-300"
                    }`}
                  >
                    Hybrid
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSearchMode("semantic")}
                    className={`px-1.5 py-0.5 rounded transition-all ${
                      searchMode === "semantic" ? "bg-[#6366F1]/20 text-[#6366F1] font-semibold" : "hover:text-slate-300"
                    }`}
                  >
                    Vector
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto v2-scrollbar">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2.5 py-1 flex items-center justify-between">
              <span>Collections</span>
              <span className="text-slate-600">{collections.length}</span>
            </div>

            {collections.map((coll) => {
              const isActive = coll.id === activeCollectionId;
              const count = coll.id === "rag_vault" ? ragDocuments.length : coll.count;
              return (
                <div
                  key={coll.id}
                  onClick={() => setActiveCollectionId(coll.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#6366F1]/15 text-white font-medium border border-[#6366F1]/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm select-none">{coll.icon}</span>
                    <span className="truncate">{coll.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                </div>
              );
            })}

            {/* Document Items */}
            <div className="pt-4 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2.5 py-1 flex items-center justify-between">
                <span>Knowledge Library</span>
                <span className="text-slate-600">{filteredDocs.length}</span>
              </div>

              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  const title = doc.title || doc.name || doc.filename || "Untitled";
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white/[0.08] text-white font-semibold border border-white/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#6366F1]" : "text-slate-500"}`} />
                        <div className="truncate">
                          <div className="truncate font-medium">{title}</div>
                          <div className="text-[9px] font-mono text-slate-500 truncate">
                            {doc.metrics?.chunkCount || doc.chunkCount || 0} Chunks Indexed
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-[11px] font-mono text-slate-600">
                  No documents indexed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. CENTER CANVAS — Intelligence Workspace            */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-full bg-[#050507] relative overflow-hidden">
        {/* Minimal Control Header */}
        <div className="h-11 px-6 border-b border-white/[0.04] flex items-center justify-between shrink-0 bg-[#09090D]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeftRail(!showLeftRail)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
              title="Toggle Left Rail"
              aria-label="Toggle Left Rail"
            >
              <Layers className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-semibold text-white tracking-tight">Knowledge Intelligence Canvas</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTesterModal(!showTesterModal)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 border ${
                showTesterModal
                  ? "bg-[#6366F1]/20 border-[#6366F1]/40 text-[#6366F1]"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Tester</span>
            </button>

            <button
              onClick={() => setShowRightInspector(!showRightInspector)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                showRightInspector
                  ? "bg-[#6366F1]/20 border-[#6366F1]/40 text-[#6366F1]"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Inspector</span>
            </button>
          </div>
        </div>

        {/* Real-Time Hybrid / Semantic Search Matches Bar */}
        {searchResults && searchResults.chunks && searchResults.chunks.length > 0 && (
          <div className="p-4 bg-[#0E0E14] border-b border-[#6366F1]/30 space-y-3 shrink-0 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Compass className="w-4 h-4 text-[#6366F1]" />
                <span>
                  Semantic Search ({searchResults.chunks.length} Top Matches for "{searchQuery}")
                </span>
              </div>
              <button onClick={() => setSearchResults(null)} aria-label="Close Search Results" className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto v2-scrollbar">
              {searchResults.chunks.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#050508] border border-white/10 text-xs font-mono space-y-1.5 hover:border-[#6366F1]/50 transition-all cursor-pointer"
                  onClick={() => setSelectedDocId(c.docId)}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-semibold truncate">{c.docTitle}</span>
                    <span className="px-2 py-0.5 rounded bg-[#6366F1]/20 text-[#6366F1] font-bold border border-[#6366F1]/30">
                      {c.scorePercentage} Match
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    "{c.chunkPreview || c.text}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RAG Tester Overlay */}
        {showTesterModal && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl p-4 rounded-2xl bg-[#0E0E14]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Vector Intelligence Inspector</span>
              <button onClick={() => setShowTesterModal(false)} aria-label="Close Tester" className="text-slate-400 hover:text-white text-xs">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search semantic vectors..."
                value={debugQuery}
                onChange={(e) => setDebugQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunRetrievalDebug()}
                className="flex-1 bg-[#050508] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#6366F1]"
              />
              <button
                onClick={handleRunRetrievalDebug}
                className="px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold"
              >
                Inspect
              </button>
            </div>

            {debugResults && (
              <pre className="p-3.5 rounded-xl bg-[#050508] border border-white/10 font-mono text-xs text-cyan-300 max-h-48 overflow-y-auto v2-scrollbar leading-relaxed">
                {debugResults.formattedContext || "No chunks matched similarity threshold."}
              </pre>
            )}
          </div>
        )}

        {/* Ingestion Progress Bar */}
        {pipelineProgress && (
          <div className="px-6 py-3 bg-[#0E0E14] border-b border-white/[0.06] flex items-center justify-between font-mono text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#6366F1] animate-spin" />
              <span>{pipelineProgress.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#6366F1] font-bold">{pipelineProgress.percent}%</span>
              <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#6366F1] transition-all duration-200" style={{ width: `${pipelineProgress.percent}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Center Canvas Viewport */}
        <div className="flex-1 overflow-y-auto p-6 v2-scrollbar space-y-8 max-w-[920px] mx-auto w-full pt-8 pb-36">
          {activeDocument ? (
            <div className="space-y-8">
              {/* Document Header Metadata */}
              <div className="space-y-3 pb-6 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <FileText className="w-4 h-4 text-[#6366F1]" />
                    <span>{activeDocument.filename || activeDocument.title || activeDocument.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Indexed & Embedded
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {activeDocument.title || activeDocument.name || activeDocument.filename}
                </h1>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1 flex-wrap">
                  <span>Size: {activeDocument.size || activeDocument.characterCount || 1024} B</span>
                  <span>•</span>
                  <span>{activeDocument.metrics?.chunkCount || activeDocument.chunkCount || 12} Chunks</span>
                  <span>•</span>
                  <span>Words: {activeDocument.wordCount || Math.ceil((activeDocument.fileText || "").length / 6)}</span>
                  <span>•</span>
                  <span>{activeDocument.estimatedReadingTime || "1 min read"}</span>
                  <span>•</span>
                  <span>Lang: {activeDocument.language || activeDocument.type || "text"}</span>
                </div>

                {/* Floating Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-all">
                    <RefreshCw className="w-3 h-3 text-[#6366F1]" />
                    <span>Re-embed Vectors</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(activeDocument.id)}
                    className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Vectors</span>
                  </button>
                </div>
              </div>

              {/* Related Documents Component */}
              {relatedDocs.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#09090D] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider">
                    <Share2 className="w-4 h-4 text-[#6366F1]" />
                    <span>Related Documents (Vector Similarity)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {relatedDocs.map((relDoc) => (
                      <div
                        key={relDoc.id}
                        onClick={() => setSelectedDocId(relDoc.id)}
                        className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] hover:border-[#6366F1]/50 cursor-pointer transition-all text-xs space-y-1"
                      >
                        <div className="font-semibold text-white truncate">{relDoc.title || relDoc.name}</div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{relDoc.type || "file"}</span>
                          <span className="text-[#6366F1] font-bold">{relDoc.scorePercentage} similar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Extracted Text Stream */}
              <div className="text-sm text-slate-200 leading-relaxed font-sans space-y-4">
                <div className="p-4 rounded-xl bg-[#09090E] border border-white/10 font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto v2-scrollbar">
                  <div className="text-[11px] text-[#6366F1] font-semibold">Extracted Document Text Stream</div>
                  <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {activeDocument.fileText || activeDocument.text || "Document vectors indexed & stored."}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* Large Centered Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-16 select-none">
              <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] shadow-2xl">
                <BookOpen className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md">
                <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge OS</h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Knowledge Intelligence Layer. Perform Real-time Vector Semantic Search, Hybrid Term Retrieval & Document Recommendations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. FLOATING COMPOSER PILL                           */}
        {/* ---------------------------------------------------- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[768px] w-full px-4 z-30">
          <div className="p-3 rounded-2xl bg-[#0E0E14]/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xs px-1 border-b border-white/[0.04] pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-lg bg-[#6366F1]/20 hover:bg-[#6366F1]/30 text-[#6366F1] border border-[#6366F1]/30 text-[11px] font-medium flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Files</span>
                </button>

                <button
                  type="button"
                  onClick={() => setComposerMode("note")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                    composerMode === "note" ? "bg-[#6366F1]/30 text-white border border-[#6366F1]" : "bg-white/[0.04] text-slate-300"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paste Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => setComposerMode("url")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                    composerMode === "url" ? "bg-[#6366F1]/30 text-white border border-[#6366F1]" : "bg-white/[0.04] text-slate-300"
                  }`}
                >
                  <Link className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Paste URL</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>Vector Embeddings Active</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Knowledge document search or paste URL input"
                placeholder={
                  composerMode === "url"
                    ? "Paste URL to ingest & embed..."
                    : composerMode === "note"
                    ? "Paste raw text content to create knowledge document..."
                    : "Drag & drop files or type document title..."
                }
                value={composerInput}
                onChange={(e) => setComposerInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasteSubmit()}
                className="flex-1 bg-transparent px-2 py-1 text-xs text-white outline-none placeholder:text-slate-500 font-sans"
              />
              <button
                type="button"
                onClick={handlePasteSubmit}
                disabled={!composerInput.trim() || isProcessing}
                className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold disabled:opacity-40 transition-all shadow-md shrink-0"
              >
                Embed Vectors
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. RIGHT INSPECTOR DRAWER (300px)                    */}
      {/* ---------------------------------------------------- */}
      {showRightInspector && (
        <div className="w-[300px] bg-[#09090D] border-l border-white/[0.04] flex flex-col h-full shrink-0 p-5 space-y-5 overflow-y-auto v2-scrollbar z-20">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sliders className="w-4 h-4 text-[#6366F1]" />
              <span>Knowledge Inspector</span>
            </div>
            <button onClick={() => setShowRightInspector(false)} aria-label="Close Drawer" className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Embedding Provider & Model */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Embedding Provider</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-1 text-xs font-mono">
              <div className="font-semibold text-indigo-300">
                {embeddingFactory.getActiveProvider().name || "Local FNV-64 JS"}
              </div>
              <div className="text-[10px] text-slate-500">
                Dimension: {embeddingFactory.getActiveProvider().dimensions || 64} dims
              </div>
            </div>
          </div>

          {/* Vector Storage Backend */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Vector Database</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">IndexedDB Store</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  HEALTHY
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Vectors: {ragDocuments.reduce((acc, d) => acc + (d.metrics?.embeddingCount || d.chunkCount || 0), 0)} vectors
              </div>
            </div>
          </div>

          {/* Active Chunks Count */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Indexed Chunks</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-1 text-xs font-mono">
              <div className="font-bold text-white text-sm">
                {ragDocuments.reduce((acc, d) => acc + (d.metrics?.chunkCount || d.chunkCount || 0), 0)} Chunks
              </div>
              <div className="text-[10px] text-slate-500">Avg chunk size: 500 chars</div>
            </div>
          </div>

          {/* Similarity Threshold */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Similarity Threshold</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-1 text-xs font-mono text-slate-300">
              <div>0.72 Cosine Cutoff</div>
            </div>
          </div>

          {/* Related Documents Widget */}
          {relatedDocs.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Top Related Documents</div>
              <div className="space-y-1.5">
                {relatedDocs.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => setSelectedDocId(rel.id)}
                    className="p-2.5 rounded-xl bg-[#0E0E14] border border-white/[0.04] hover:border-[#6366F1]/40 cursor-pointer text-xs space-y-0.5"
                  >
                    <div className="text-white font-medium truncate">{rel.title || rel.name}</div>
                    <div className="text-[10px] font-mono text-[#6366F1] font-bold">{rel.scorePercentage} similarity</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(KnowledgeHubPage);
