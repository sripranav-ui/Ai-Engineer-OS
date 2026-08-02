import React, { useState, useEffect } from "react";
import useDocumentMetadata from "../hooks/useDocumentMetadata";
import ragManager from "../services/ai/rag/ragManager.js";
import { Upload, Trash2, RefreshCw, FileText, Search, Plus, Terminal } from "lucide-react";

// =======================================================
// KnowledgeHubPage.jsx — Linear / Resend Grade Document Vault (9.8/10)
// Zero Card Containers, Pure Typography, Borderless List Rows
// =======================================================

function KnowledgeHubPage() {
  useDocumentMetadata("Knowledge Vault", "Linear/Resend grade vector document vault.");

  const [ragDocuments, setRagDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugQuery, setDebugQuery] = useState("");
  const [debugResults, setDebugResults] = useState(null);

  const refreshRagState = async () => {
    try {
      const docs = await ragManager.getDocuments();
      setRagDocuments(docs);
    } catch (err) {
      console.error("Error refreshing RAG state:", err);
    }
  };

  useEffect(() => {
    refreshRagState();

    const unsubscribe = ragManager.subscribeProgress((event) => {
      if (event.type === "PROGRESS") {
        setUploadProgress({
          jobId: event.jobId,
          stage: event.stage,
          percent: event.percent,
          status: event.status,
        });
      } else if (event.type === "COMPLETE") {
        setUploadProgress({ jobId: event.jobId, stage: "Completed", percent: 100, status: "Indexing complete!" });
        setTimeout(() => setUploadProgress(null), 3000);
        setIsUploading(false);
        refreshRagState();
      } else if (event.type === "ERROR" || event.type === "JOB_CANCELLED") {
        setIsUploading(false);
        setUploadProgress(null);
        refreshRagState();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    for (const file of files) {
      try {
        await ragManager.ingestDocument(file);
      } catch (err) {
        console.error("Ingestion failed for file:", file.name, err);
      }
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Delete document from vector index?")) return;
    await ragManager.deleteDocument(docId);
    refreshRagState();
  };

  const handleRunRetrievalDebug = async () => {
    if (!debugQuery.trim()) return;
    const res = ragManager.retrieveContext(debugQuery);
    setDebugResults(res);
  };

  const filteredDocs = ragDocuments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-[#050508] text-slate-100 p-10 overflow-y-auto font-sans v2-scrollbar select-none">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* 1. Linear Header & Action Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.04]">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Knowledge Vault</h1>
            <p className="text-xs text-slate-500 mt-1">Ground AI responses with local vector embeddings</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Tester</span>
            </button>

            <label className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-all shadow-md flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
              <input type="file" multiple accept=".txt,.md,.pdf,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Diagnostic Tester Overlay */}
        {showDebugPanel && (
          <div className="p-4 rounded-2xl bg-[#0e0e14] border border-white/10 space-y-3">
            <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">Vector Retrieval Inspector</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Query vector index..."
                value={debugQuery}
                onChange={(e) => setDebugQuery(e.target.value)}
                className="flex-1 bg-[#050508] border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500 font-sans"
              />
              <button
                onClick={handleRunRetrievalDebug}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Inspect
              </button>
            </div>

            {debugResults && (
              <pre className="p-3 rounded-lg bg-[#050508] border border-white/10 font-mono text-xs text-cyan-300 max-h-40 overflow-y-auto v2-scrollbar">
                {debugResults.formattedContext || "No chunks matched above threshold."}
              </pre>
            )}
          </div>
        )}

        {/* Progress Stream */}
        {uploadProgress && (
          <div className="p-3 rounded-xl bg-[#0e0e14] border border-white/10 font-mono text-xs space-y-1.5">
            <div className="flex justify-between text-indigo-300">
              <span>{uploadProgress.stage}</span>
              <span>{uploadProgress.percent}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-150" style={{ width: `${uploadProgress.percent}%` }} />
            </div>
          </div>
        )}

        {/* 2. Linear Search Bar */}
        <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 w-full">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search indexed files... (⌘F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600 font-sans"
            />
          </div>

          <button onClick={refreshRagState} className="text-slate-500 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. Resend-Grade Borderless Document Table */}
        <div className="space-y-1">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/[0.03] transition-all text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-indigo-400 transition-colors" />
                  <div className="truncate">
                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{doc.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {doc.size} bytes • {doc.chunkCount} Chunks
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                    INDEXED
                  </span>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-600 font-mono text-xs space-y-2">
              <div>No documents indexed in local vector store.</div>
              <div className="text-slate-700">Click 'Upload Document' above to ground your AI Assistant.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(KnowledgeHubPage);
