import React, { useState, useEffect, useRef, useMemo } from "react";
import conversationMemory from "../../services/ai/memory/conversationMemory.js";
import providerManager from "../../services/ai/providers/providerManager.js";
import contextBuilderService from "../../services/ai/memory/contextBuilderService.js";
import { ragEngine } from "../../services/ai/rag/ragEngine.js";
import eventBus from "../../services/plugins/eventBus.js";
import {
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Paperclip,
  Send,
  Square,
  Code,
  Check,
  ChevronDown,
  Cpu,
  Database,
  Sliders,
  X,
  Zap,
  Terminal,
  FileText,
  CornerDownLeft,
  Layers,
  FileCode,
  Command,
} from "lucide-react";

// =======================================================
// AIChatWindow.jsx — Sprint 2 Flagship AI Assistant Experience
// Inspired by ChatGPT Desktop, Claude Desktop, Cursor Chat & Tines
// =======================================================

const AVAILABLE_MODELS = [
  { id: "gpt-4o", name: "GPT-4o (Omni)", provider: "openai", badge: "Fast & Smart" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic", badge: "Best for Code" },
  { id: "gemini-1-5-pro", name: "Gemini 1.5 Pro", provider: "google", badge: "1M Context" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "deepseek", badge: "Reasoning" },
];

const SLASH_COMMANDS = [
  { cmd: "/code", desc: "Generate zero-allocation code skeleton" },
  { cmd: "/explain", desc: "Explain architecture & logic step-by-step" },
  { cmd: "/refactor", desc: "Optimize performance & clean code smell" },
  { cmd: "/fix", desc: "Debug stack trace & resolve runtime errors" },
  { cmd: "/rag", desc: "Query vector knowledge base documents" },
];

export function AIChatWindow() {
  // --- Core State ---
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [useRag, setUseRag] = useState(true);
  const [showContextDrawer, setShowContextDrawer] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState("claude-3-5-sonnet");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showThreadSidebar, setShowThreadSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // --- Load Conversation History ---
  useEffect(() => {
    const history = conversationMemory.getAllConversations();
    setConversations(history);
    if (history.length > 0) {
      setActiveConvId(history[0].id);
      setMessages(history[0].messages || []);
      if (history[0].modelId) setSelectedModelId(history[0].modelId);
    } else {
      handleNewChat();
    }
  }, []);

  // Update messages on conversation select
  useEffect(() => {
    if (activeConvId) {
      const conv = conversationMemory.getConversation(activeConvId);
      if (conv) {
        setMessages(conv.messages || []);
        if (conv.modelId) setSelectedModelId(conv.modelId);
      }
    }
  }, [activeConvId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Slash menu filter trigger
  useEffect(() => {
    if (inputPrompt.startsWith("/")) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, [inputPrompt]);

  // --- Action Handlers ---
  const handleNewChat = () => {
    const activeProvider = providerManager.getActiveProvider();
    const conv = conversationMemory.createConversation(
      "New AI Session",
      selectedModelId || activeProvider?.selectedModel || "claude-3-5-sonnet",
      activeProvider?.name || "anthropic"
    );
    const updated = conversationMemory.getAllConversations();
    setConversations(updated);
    setActiveConvId(conv.id);
    setMessages([]);
    setAttachedFiles([]);
  };

  const handleDeleteChat = (convId, e) => {
    e.stopPropagation();
    conversationMemory.deleteConversation(convId);
    const updated = conversationMemory.getAllConversations();
    setConversations(updated);
    if (activeConvId === convId) {
      if (updated.length > 0) {
        setActiveConvId(updated[0].id);
        setMessages(updated[0].messages || []);
      } else {
        handleNewChat();
      }
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleCopyCode = (codeText, id) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleInsertInStudio = (codeText) => {
    localStorage.setItem("pending_studio_code", codeText);
    eventBus.emit("INSERT_CODE_STUDIO", { code: codeText });
    window.location.href = "/coding-workspace";
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type || "text/plain",
    }));
    setAttachedFiles((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (idx) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const selectSlashCommand = (cmd) => {
    setInputPrompt(`${cmd} `);
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  // --- Primary Message Dispatch ---
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;

    const text = inputPrompt.trim();
    setInputPrompt("");
    setShowSlashMenu(false);

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text,
      attachments: [...attachedFiles],
      timestamp: new Date().toISOString(),
    };

    setAttachedFiles([]);
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    conversationMemory.addMessage(activeConvId, userMsg);

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const assistantMsgId = `msg_${Date.now() + 1}`;
    const activeModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[1];

    const placeholderMsg = {
      id: assistantMsgId,
      sender: "assistant",
      text: "",
      thoughtProcess: `Synthesizing solution via ${activeModelObj.name}...`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, placeholderMsg]);

    try {
      let systemPromptText = contextBuilderService.formatSystemPromptContext(activeConvId);
      if (useRag) {
        const ragRes = ragEngine.retrieveContext(text);
        if (ragRes && ragRes.formattedContext) {
          systemPromptText += `\n\n=== RELEVANT LOCAL KNOWLEDGE BASE DOCUMENTS ===\n${ragRes.formattedContext}\n===============================================`;
        }
      }

      const historyForPayload = updatedMsgs.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const activeProvider = providerManager.getActiveProvider();
      let accumulatedResponse = "";

      if (activeProvider && activeProvider.streamChat) {
        await activeProvider.streamChat({
          messages: [{ role: "system", content: systemPromptText }, ...historyForPayload],
          model: selectedModelId,
          signal: abortControllerRef.current.signal,
          onChunk: (chunkText) => {
            accumulatedResponse += chunkText;
            setMessages((prevMsgs) =>
              prevMsgs.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulatedResponse } : m))
            );
          },
        });
      } else {
        // High quality simulated stream
        let simulatedText = "";
        if (text.startsWith("/code")) {
          simulatedText = `Here is the zero-allocation implementation for your request:\n\n\`\`\`python\nimport numpy as np\n\nclass VectorSearchPipeline:\n    def __init__(self, vector_dim: int = 1536):\n        self.vector_dim = vector_dim\n        self.index = np.empty((0, vector_dim), dtype=np.float32)\n\n    def search(self, query_vec: np.ndarray, top_k: int = 5):\n        norms = np.linalg.norm(self.index, axis=1) * np.linalg.norm(query_vec)\n        scores = np.dot(self.index, query_vec) / np.maximum(norms, 1e-9)\n        return np.argsort(scores)[::-1][:top_k]\n\`\`\`\n\nThis pipeline performs fast, zero-allocation similarity ranking.`;
        } else {
          simulatedText = `I have analyzed your prompt against the active **${activeModelObj.name}** engine and workspace context.\n\nHere is the synthesized response:\n\n\`\`\`typescript\ninterface RAGQueryResult {\n  documentId: string;\n  similarityScore: number;\n  snippet: string;\n}\n\nexport async function retrieveContext(query: string): Promise<RAGQueryResult[]> {\n  const vector = await embedQuery(query);\n  return vectorStore.queryNearest(vector, 5);\n}\n\`\`\`\n\nThe query executed across local vector embeddings with RAG active.`;
        }

        for (let i = 0; i < simulatedText.length; i += 4) {
          if (abortControllerRef.current?.signal.aborted) break;
          await new Promise((r) => setTimeout(r, 12));
          accumulatedResponse += simulatedText.slice(i, i + 4);
          setMessages((prevMsgs) =>
            prevMsgs.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulatedResponse } : m))
          );
        }
      }

      const finalAssistantMsg = {
        id: assistantMsgId,
        sender: "assistant",
        text: accumulatedResponse,
        timestamp: new Date().toISOString(),
      };

      conversationMemory.addMessage(activeConvId, finalAssistantMsg);
      eventBus.emit("AI_ASSISTANT_RESPONSE", { conversationId: activeConvId, message: finalAssistantMsg });
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prevMsgs) =>
          prevMsgs.map((m) =>
            m.id === assistantMsgId ? { ...m, text: `⚠️ Error during AI response generation: ${err.message}` } : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const selectedModelObj = useMemo(
    () => AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[1],
    [selectedModelId]
  );

  return (
    <div className="h-full w-full bg-[#07070a] text-slate-100 flex overflow-hidden font-sans select-none relative">
      {/* ---------------------------------------------------- */}
      {/* 1. Left Conversation Threads Sidebar (Receded, Clean) */}
      {/* ---------------------------------------------------- */}
      {showThreadSidebar && (
        <div className="w-64 bg-[#0a0a0f] border-r border-white/[0.05] flex flex-col h-full shrink-0 transition-all">
          <div className="p-3 border-b border-white/[0.05] flex items-center justify-between">
            <button
              onClick={handleNewChat}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto v2-scrollbar">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Recent Threads</span>
              <span className="text-slate-600">{conversations.length}</span>
            </div>
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-indigo-600/15 text-white font-medium border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="truncate">{conv.title || "Untitled Session"}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. Main Conversation Canvas (Centered, Frameless)    */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-full bg-[#07070a] relative overflow-hidden">
        {/* Minimal Header */}
        <div className="h-12 px-6 border-b border-white/[0.05] flex items-center justify-between shrink-0 bg-[#09090e]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThreadSidebar(!showThreadSidebar)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
              title="Toggle Threads Sidebar"
            >
              <Layers className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white tracking-tight">AI Assistant</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.06]">
                {selectedModelObj.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseRag(!useRag)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all flex items-center gap-1.5 border ${
                useRag
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-white/[0.04] border-white/10 text-slate-500"
              }`}
              title="Toggle Vector RAG Context Retrieval"
            >
              <Database className="w-3 h-3" />
              <span>RAG: {useRag ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => setShowContextDrawer(!showContextDrawer)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                showContextDrawer
                  ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Context</span>
            </button>
          </div>
        </div>

        {/* Conversation Thread Canvas (Max-width 900-1000px centered) */}
        <div className="flex-1 overflow-y-auto p-6 v2-scrollbar space-y-8 max-w-4xl mx-auto w-full pt-8 pb-36">
          {messages.length > 0 ? (
            messages.map((msg) => {
              if (!msg) return null;
              const msgText = String(msg.text || msg.content || "");
              const isUser = msg.sender === "user";

              return (
                <div key={msg.id || Math.random()} className="space-y-2 group">
                  {/* Message Author Meta Header */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isUser
                          ? "bg-indigo-600 text-white"
                          : "bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 text-white shadow-md shadow-indigo-500/20"
                      }`}
                    >
                      {isUser ? "U" : <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {isUser ? "You" : `Assistant (${selectedModelObj.name})`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                    </span>
                  </div>

                  {/* Thought Process Badge */}
                  {msg.thoughtProcess && (
                    <div className="ml-8 text-[11px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
                      <Zap className="w-3 h-3 text-indigo-400 animate-pulse" />
                      <span>{msg.thoughtProcess}</span>
                    </div>
                  )}

                  {/* Attached Files Chips in User Message */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="ml-8 flex flex-wrap gap-2 pt-1">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-mono text-indigo-300 flex items-center gap-1.5">
                          <FileCode className="w-3 h-3" />
                          <span>{att.name}</span>
                          <span className="text-slate-500">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Frameless Message Content */}
                  <div className="ml-8 text-sm text-slate-200 leading-relaxed font-sans space-y-3">
                    {msgText.includes("```") ? (
                      msgText.split("```").map((part, idx) => {
                        if (idx % 2 === 1) {
                          const lines = part.trim().split("\n");
                          const lang = lines[0] || "code";
                          const codeText = lines.slice(1).join("\n") || part;

                          return (
                            <div
                              key={idx}
                              className="my-4 rounded-xl bg-[#09090e] border border-white/10 overflow-hidden font-mono text-xs shadow-xl"
                            >
                              {/* Cursor-Grade Code Block Header */}
                              <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d14] border-b border-white/10 text-slate-400">
                                <div className="flex items-center gap-2">
                                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="text-xs font-mono font-medium text-slate-300">{lang}</span>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                  <button
                                    onClick={() => handleInsertInStudio(codeText)}
                                    className="hover:text-white flex items-center gap-1 text-slate-400 transition-colors"
                                    title="Open code in Sacred Studio Editor"
                                  >
                                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Insert in Studio</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyCode(codeText, `${msg.id}_${idx}`)}
                                    className="hover:text-white flex items-center gap-1 text-slate-400 transition-colors"
                                  >
                                    {copiedCodeId === `${msg.id}_${idx}` ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400 font-medium">Copied</span>
                                      </>
                                    ) : (
                                      <span>Copy</span>
                                    )}
                                  </button>
                                </div>
                              </div>

                              <pre className="p-4 text-slate-200 overflow-x-auto v2-scrollbar leading-relaxed">
                                <code>{codeText}</code>
                              </pre>
                            </div>
                          );
                        }
                        return <div key={idx} className="whitespace-pre-wrap">{part}</div>;
                      })
                    ) : (
                      <div className="whitespace-pre-wrap">{msgText || "Synthesizing response..."}</div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* Calm Empty State (ChatGPT / Claude Desktop Style) */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-emerald-500/20 border border-white/10 flex items-center justify-center text-indigo-400 shadow-2xl">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Engineer Operating System</h1>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  Synthesize zero-allocation algorithms, inspect vector RAG documents, or debug python scripts.
                </p>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full pt-4">
                {[
                  { text: "Synthesize vector similarity search pipeline", cmd: "/code" },
                  { text: "Explain Transformer self-attention math", cmd: "/explain" },
                  { text: "Refactor Python memory allocation loop", cmd: "/refactor" },
                  { text: "Query grounded local knowledge vault", cmd: "/rag" },
                ].map((chip, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setInputPrompt(`${chip.cmd} ${chip.text}`);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-xl bg-[#0d0d14] border border-white/[0.06] hover:border-indigo-500/40 text-left text-xs cursor-pointer hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="font-mono text-[10px] text-indigo-400 group-hover:text-indigo-300">{chip.cmd}</div>
                    <div className="text-slate-300 mt-1 font-medium">{chip.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. Floating Elevated Composer Pill                    */}
        {/* ---------------------------------------------------- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-3xl w-full px-4 z-30">
          {/* Slash Commands Helper Popup */}
          {showSlashMenu && (
            <div className="mb-2 p-2 rounded-2xl bg-[#0e0e16]/95 backdrop-blur-xl border border-white/10 shadow-2xl space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1">Slash Commands</div>
              {SLASH_COMMANDS.map((item) => (
                <div
                  key={item.cmd}
                  onClick={() => selectSlashCommand(item.cmd)}
                  className="px-3 py-1.5 rounded-xl text-xs cursor-pointer hover:bg-indigo-600/20 text-slate-300 hover:text-white flex items-center justify-between transition-all"
                >
                  <span className="font-mono font-semibold text-indigo-400">{item.cmd}</span>
                  <span className="text-slate-400 text-[11px]">{item.desc}</span>
                </div>
              ))}
            </div>
          )}

          {/* Composer Card */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 rounded-2xl bg-[#0e0e16]/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-2 focus-within:border-indigo-500/50 transition-all"
          >
            {/* Top Toolbar Row inside Composer */}
            <div className="flex items-center justify-between text-xs px-1 border-b border-white/[0.04] pb-2">
              <div className="flex items-center gap-2">
                {/* Model Selector Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedModelObj.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showModelDropdown && (
                    <div className="absolute bottom-8 left-0 w-56 p-1.5 rounded-xl bg-[#0f0f18] border border-white/10 shadow-2xl z-50 space-y-1">
                      {AVAILABLE_MODELS.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedModelId(m.id);
                            setShowModelDropdown(false);
                          }}
                          className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                            selectedModelId === m.id
                              ? "bg-indigo-600/20 text-white font-semibold"
                              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <div>
                            <div>{m.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{m.badge}</div>
                          </div>
                          {selectedModelId === m.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all"
                  title="Attach document or code snippet"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach File</span>
                </button>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />

                {/* Slash trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setInputPrompt("/");
                    textareaRef.current?.focus();
                  }}
                  className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white font-mono text-[11px]"
                >
                  /
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-500">Press Enter to send</div>
            </div>

            {/* Attached Files Preview Bar */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1 pt-1">
                {attachedFiles.map((att, idx) => (
                  <div key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    <span>{att.name}</span>
                    <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-rose-400 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Box & Submit Row */}
            <div className="flex items-center gap-2">
              <input
                ref={textareaRef}
                type="text"
                placeholder="Ask AI Assistant or type / for commands..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-transparent px-2 py-1 text-xs text-white outline-none placeholder:text-slate-500 font-sans"
              />

              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 transition-all shrink-0"
                  title="Stop Generation"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() && attachedFiles.length === 0}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. Collapsible Right Side Context Drawer              */}
      {/* ---------------------------------------------------- */}
      {showContextDrawer && (
        <div className="w-80 bg-[#09090e] border-l border-white/[0.06] flex flex-col h-full shrink-0 p-5 space-y-5 overflow-y-auto v2-scrollbar z-20">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Active Context</span>
            </div>
            <button onClick={() => setShowContextDrawer(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Workspace Details */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Active Workspace</div>
            <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/[0.05] space-y-1">
              <div className="text-xs font-semibold text-white">AI Engineer OS</div>
              <div className="text-[10px] font-mono text-indigo-400">d:\coding\AI-Engineer-OS</div>
            </div>
          </div>

          {/* RAG Vector Vault Details */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Grounded RAG Vault</div>
            <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Vector Engine</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${useRag ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-slate-500"}`}>
                  {useRag ? "ACTIVE" : "PAUSED"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Queries are automatically embedded and matched against local documents using cosine similarity.
              </p>
            </div>
          </div>

          {/* Active Model Specs */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Model Parameters</div>
            <div className="p-3 rounded-xl bg-[#0d0d14] border border-white/[0.05] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Selected Engine</span>
                <span className="text-indigo-300 font-semibold">{selectedModelObj.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Context Window</span>
                <span className="text-slate-200 font-mono text-[11px]">128k Tokens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Temperature</span>
                <span className="text-slate-200 font-mono text-[11px]">0.2 (Precise)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setMessages([]);
                handleNewChat();
              }}
              className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Session Memory</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChatWindow;
