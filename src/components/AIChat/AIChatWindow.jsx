import React, { useState, useEffect, useRef, useMemo } from "react";
import conversationMemory from "../../services/ai/memory/conversationMemory.js";
import providerManager from "../../services/ai/providers/providerManager.js";
import memoryContextBuilder from "../../services/ai/memory/contextBuilderService.js";
import ragContextBuilder from "../../services/ai/rag/contextBuilder.js";
import { ragEngine } from "../../services/ai/rag/ragEngine.js";
import eventBus from "../../services/plugins/eventBus.js";
import aiOrchestrator from "../../services/ai/orchestrator/aiOrchestrator.js";
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
  ChevronUp,
  Cpu,
  Database,
  Sliders,
  X,
  Zap,
  Terminal,
  FileText,
  Layers,
  FileCode,
  Play,
  ExternalLink,
  Folder,
  Clock,
  Activity,
} from "lucide-react";
import AutonomousTaskWorkflow from "../Agent/AutonomousTaskWorkflow.jsx";

// =======================================================
// AIChatWindow.jsx — Phase 2 AI Assistant Experience
// Inspired by Claude Desktop, ChatGPT Desktop, Legora & Tines
// Single Source of Truth Implementation
// =======================================================

const AVAILABLE_MODELS = [
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic", badge: "Best for Code" },
  { id: "gpt-4o", name: "GPT-4o (Omni)", provider: "openai", badge: "Fast & Smart" },
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
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showThreadSidebar, setShowThreadSidebar] = useState(true);
  const [collapsedCodeBlocks, setCollapsedCodeBlocks] = useState({});
  const [runningCodeId, setRunningCodeId] = useState(null);
  const [expandedRagMsgId, setExpandedRagMsgId] = useState(null);
  const [agentMode, setAgentMode] = useState(false);
  const [showAutonomousWorkflow, setShowAutonomousWorkflow] = useState(false);

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

  // --- Action Handlers ---
  const handleNewChat = () => {
    const activeProvider = providerManager.getActiveProvider();
    const conv = conversationMemory.createConversation(
      "New Session",
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

  const [insertedToastId, setInsertedToastId] = useState(null);

  const handleInsertInStudio = (codeText, lang = "python", filename = "") => {
    if (!codeText) return;
    const payload = {
      id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: codeText,
      language: lang || "python",
      filename: filename || `generated_${Date.now().toString().slice(-4)}.py`,
      timestamp: new Date().toISOString(),
      conversationId: activeConvId || "default",
    };

    let queue = [];
    try {
      const raw = localStorage.getItem("pending_studio_queue");
      queue = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(queue)) queue = [];
    } catch {
      queue = [];
    }

    // Prevent duplicate insertion into queue
    if (!queue.some((item) => item.code === codeText)) {
      queue.push(payload);
      localStorage.setItem("pending_studio_queue", JSON.stringify(queue));
      localStorage.setItem("pending_studio_code", codeText);
    }

    // Publish event via eventBus
    eventBus.emit("INSERT_CODE_STUDIO", payload);

    setInsertedToastId(payload.id);
    setTimeout(() => setInsertedToastId(null), 2500);
  };

  const handleRunCode = (codeText, id) => {
    setRunningCodeId(id);
    setTimeout(() => {
      setRunningCodeId(null);
      alert(`[Studio Runtime] Execution output:\n${codeText.slice(0, 120)}...`);
    }, 1200);
  };

  const toggleCollapseBlock = (id) => {
    setCollapsedCodeBlocks((prev) => ({ ...prev, [id]: !prev[id] }));
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
    textareaRef.current?.focus();
  };

  // --- Primary Message Dispatch ---
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;

    const text = inputPrompt.trim();
    setInputPrompt("");

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
    const activeModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];

    const placeholderMsg = {
      id: assistantMsgId,
      sender: "assistant",
      text: "",
      thoughtProcess: `Orchestrating request via AI Orchestrator Layer (${activeModelObj.name})...`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, placeholderMsg]);

    try {
      let accumulatedResponse = "";
      const orchestratorResult = await aiOrchestrator.processRequest(
        {
          promptText: text,
          conversationId: activeConvId,
          modelId: selectedModelId,
          useRag,
          agentMode,
          attachments: attachedFiles,
        },
        (chunkText) => {
          accumulatedResponse += chunkText;
          setMessages((prevMsgs) =>
            prevMsgs.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulatedResponse } : m))
          );
        },
        abortControllerRef.current?.signal
      );

      const finalContent = orchestratorResult.text || accumulatedResponse;

      setMessages((prevMsgs) =>
        prevMsgs.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: finalContent,
                ragSources: orchestratorResult.ragSources || [],
                hasKnowledge: orchestratorResult.hasKnowledge,
                plan: orchestratorResult.plan,
              }
            : m
        )
      );

      const finalAssistantMsg = {
        id: assistantMsgId,
        sender: "assistant",
        text: finalContent,
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
    () => AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0],
    [selectedModelId]
  );

  return (
    <div className="h-full w-full bg-[#050507] text-[#F8FAFC] flex overflow-hidden font-sans select-none relative">
      {/* ---------------------------------------------------- */}
      {/* 1. Left Conversation Rail (Receded & Quiet)         */}
      {/* ---------------------------------------------------- */}
      {showThreadSidebar && (
        <div className="w-60 bg-[#09090D] border-r border-white/[0.04] flex flex-col h-full shrink-0 transition-all z-10">
          <div className="p-3 border-b border-white/[0.04]">
            <button
              onClick={handleNewChat}
              className="w-full py-2 px-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Conversation</span>
            </button>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto v2-scrollbar">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Recent Sessions</span>
              <span className="text-slate-600">{conversations.length}</span>
            </div>
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#6366F1]/15 text-white font-medium border border-[#6366F1]/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#6366F1]" : "text-slate-500"}`} />
                    <span className="truncate">{conv.title || "Untitled Session"}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                    title="Delete thread"
                    aria-label="Delete thread"
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
      {/* 2. Main Conversation Canvas (Centered max-w 920px)   */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-full bg-[#050507] relative overflow-hidden">
        {/* Minimal Header */}
        <div className="h-11 px-6 border-b border-white/[0.04] flex items-center justify-between shrink-0 bg-[#09090D]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThreadSidebar(!showThreadSidebar)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
              title="Toggle Sidebar"
              aria-label="Toggle Sidebar"
            >
              <Layers className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span className="text-xs font-semibold text-white tracking-tight">AI Assistant</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                {selectedModelObj.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseRag(!useRag)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all flex items-center gap-1.5 border ${
                useRag
                  ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]"
                  : "bg-white/[0.04] border-white/10 text-slate-500"
              }`}
              title="Toggle Vector RAG Context Retrieval"
            >
              <Database className="w-3 h-3" />
              <span>RAG: {useRag ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => setAgentMode(!agentMode)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all flex items-center gap-1.5 border ${
                agentMode
                  ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                  : "bg-white/[0.04] border-white/10 text-slate-500"
              }`}
              title="Toggle Agent Mode for autonomous engineering execution"
            >
              <Zap className="w-3 h-3" />
              <span>Agent: {agentMode ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => setShowContextDrawer(!showContextDrawer)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                showContextDrawer
                  ? "bg-[#6366F1]/20 border-[#6366F1]/40 text-[#6366F1]"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Context</span>
            </button>
          </div>
        </div>

        {/* Conversation Reading Viewport (Max-width 920px centered) */}
        <div className="flex-1 overflow-y-auto p-6 v2-scrollbar space-y-8 max-w-[920px] mx-auto w-full pt-8 pb-36">
          {messages.length > 0 ? (
            messages.map((msg) => {
              if (!msg) return null;
              const msgText = String(msg.text || msg.content || "");
              const isUser = msg.sender === "user";

              return (
                <div key={msg.id || Math.random()} className="space-y-2">
                  {/* Lightweight Message Meta Header */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isUser
                          ? "bg-slate-800 text-slate-300"
                          : "bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/30"
                      }`}
                    >
                      {isUser ? "U" : <Sparkles className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      {isUser ? "You" : `Assistant (${selectedModelObj.name})`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                    </span>
                  </div>

                  {/* Thought Process Badge */}
                  {msg.thoughtProcess && (
                    <div className="ml-7 text-[11px] font-mono text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 px-3 py-1 rounded-lg inline-flex items-center gap-2">
                      <Zap className="w-3 h-3 text-[#6366F1] animate-pulse" />
                      <span>{msg.thoughtProcess}</span>
                    </div>
                  )}

                  {/* Attached Files Chips */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="ml-7 flex flex-wrap gap-2 pt-1">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-indigo-300 flex items-center gap-1.5">
                          <FileCode className="w-3 h-3" />
                          <span>{att.name}</span>
                          <span className="text-slate-500">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document-Style Message Content (No chat bubble cards) */}
                  <div className="ml-7 text-sm text-slate-200 leading-relaxed font-sans space-y-3">
                    {msgText.includes("```") ? (
                      msgText.split("```").map((part, idx) => {
                        if (idx % 2 === 1) {
                          const lines = part.trim().split("\n");
                          const lang = lines[0] || "code";
                          const codeText = lines.slice(1).join("\n") || part;
                          const blockId = `${msg.id}_block_${idx}`;
                          const isCollapsed = collapsedCodeBlocks[blockId];

                          return (
                            <div
                              key={idx}
                              className="my-4 rounded-xl bg-[#09090E] border border-white/10 overflow-hidden font-mono text-xs shadow-lg"
                            >
                              {/* Premium Cursor/Raycast-Grade Code Header */}
                              <div className="flex items-center justify-between px-4 py-2 bg-[#0E0E14] border-b border-white/10 text-slate-400">
                                <div className="flex items-center gap-2">
                                  <Terminal className="w-3.5 h-3.5 text-[#6366F1]" />
                                  <span className="text-xs font-mono font-medium text-slate-300">{lang}</span>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                  <button
                                    onClick={() => handleRunCode(codeText, blockId)}
                                    className="hover:text-emerald-400 flex items-center gap-1 text-slate-400 transition-colors"
                                    title="Run in Studio Runtime"
                                  >
                                    <Play className="w-3 h-3 text-emerald-400" />
                                    <span>{runningCodeId === blockId ? "Running..." : "Run"}</span>
                                  </button>

                                  <button
                                    onClick={() => handleInsertInStudio(codeText, lang)}
                                    className="hover:text-white flex items-center gap-1 text-slate-400 transition-colors"
                                    title="Insert code into Sacred Studio Editor"
                                  >
                                    <Code className="w-3 h-3 text-cyan-400" />
                                    <span>{insertedToastId ? "✓ Inserted" : "Insert in Studio"}</span>
                                  </button>

                                  <button
                                    onClick={() => handleCopyCode(codeText, blockId)}
                                    className="hover:text-white flex items-center gap-1 text-slate-400 transition-colors"
                                  >
                                    {copiedCodeId === blockId ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400 font-medium">Copied</span>
                                      </>
                                    ) : (
                                      <span>Copy</span>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => toggleCollapseBlock(blockId)}
                                    className="hover:text-white text-slate-500 p-0.5"
                                    title={isCollapsed ? "Expand Code" : "Collapse Code"}
                                  >
                                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {!isCollapsed && (
                                <pre className="p-4 text-slate-200 overflow-x-auto v2-scrollbar leading-relaxed">
                                  <code>{codeText}</code>
                                </pre>
                              )}
                            </div>
                          );
                        }
                        return <div key={idx} className="whitespace-pre-wrap">{part}</div>;
                      })
                    ) : (
                      <div className="whitespace-pre-wrap">{msgText || "Synthesizing response..."}</div>
                    )}
                  </div>

                  {/* Phase 4.4 — RAG Source Attribution & Retrieved Context Viewer */}
                  {msg.sender === "assistant" && msg.ragSources && msg.ragSources.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#09090E] border border-[#6366F1]/30 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-300 font-bold">
                          <Database className="w-3.5 h-3.5 text-[#6366F1]" />
                          <span>Sources Used ({msg.ragSources.length} Vector Chunks)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedRagMsgId(expandedRagMsgId === msg.id ? null : msg.id)}
                          className="text-[11px] text-[#6366F1] hover:underline flex items-center gap-1"
                        >
                          <span>{expandedRagMsgId === msg.id ? "Hide Context" : "Retrieved Context"}</span>
                          {expandedRagMsgId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Source Badges */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.ragSources.map((src, i) => (
                          <a
                            key={i}
                            href="/knowledge"
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-[11px] border border-white/10 flex items-center gap-1.5 transition-all"
                            title={`View source ${src.docTitle}`}
                          >
                            <FileText className="w-3 h-3 text-[#6366F1]" />
                            <span className="truncate max-w-[140px] font-semibold">{src.docTitle}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">({src.scorePercentage})</span>
                          </a>
                        ))}
                      </div>

                      {/* Collapsible Retrieved Context Drawer */}
                      {expandedRagMsgId === msg.id && (
                        <div className="pt-2 space-y-2 border-t border-white/[0.06] max-h-60 overflow-y-auto v2-scrollbar">
                          {msg.ragSources.map((src, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-[#050508] border border-white/5 text-[11px] space-y-1">
                              <div className="flex items-center justify-between text-indigo-300 font-semibold">
                                <span>{src.docTitle} (Page {src.pageNumber})</span>
                                <span className="text-emerald-400">{src.scorePercentage} Match</span>
                              </div>
                              <div className="text-slate-300 leading-relaxed font-sans text-xs whitespace-pre-wrap">
                                "{src.text}"
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Missing Knowledge Notice */}
                  {msg.sender === "assistant" && msg.hasKnowledge === false && (
                    <div className="mt-2 text-[11px] font-mono text-slate-500 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.04] flex items-center gap-2">
                      <span>⚠️ No relevant knowledge found in local vector store. Continuing with general intelligence.</span>
                    </div>
                  )}

                  {/* Phase 6 — Agent Mode Execution Plan Badge */}
                  {msg.sender === "assistant" && msg.plan && (
                    <div className="mt-2 p-3 rounded-xl bg-[#09090E] border border-[#F59E0B]/20 font-mono text-[11px] space-y-1.5">
                      <div className="flex items-center gap-2 text-[#F59E0B] font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Agent Execution Plan</span>
                        <span className="text-[10px] text-slate-500 font-normal">({msg.plan.intent} • {Math.round((msg.plan.confidence || 0) * 100)}% confidence)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(msg.plan.executionOrder || []).map((step, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400 text-[10px]">
                            {i + 1}. {step}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3 text-[10px] text-slate-500">
                        {msg.plan.useMemory && <span className="text-emerald-400">✓ Memory</span>}
                        {msg.plan.useKnowledge && <span className="text-emerald-400">✓ Knowledge</span>}
                        {msg.plan.useStudio && <span className="text-emerald-400">✓ Studio</span>}
                        {msg.plan.useTools?.length > 0 && <span className="text-cyan-400">Tools: {msg.plan.useTools.join(", ")}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* Large Centered Welcome Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-16">
              <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] shadow-2xl">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Engineer OS</h1>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                  How can I help you build today?
                </p>
              </div>

              {/* Suggested Prompts Grid */}
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
                    className="p-3.5 rounded-xl bg-[#0E0E14] border border-white/[0.06] hover:border-[#6366F1]/40 text-left text-xs cursor-pointer hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="font-mono text-[10px] text-[#6366F1] group-hover:text-indigo-300">{chip.cmd}</div>
                    <div className="text-slate-300 mt-1 font-medium">{chip.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. Signature Floating Elevated Composer Pill        */}
        {/* ---------------------------------------------------- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[768px] w-full px-4 z-30">
          {/* Slash Commands Helper Popup */}
          {inputPrompt === "/" && (
            <div className="mb-2 p-2 rounded-2xl bg-[#0E0E14]/95 backdrop-blur-xl border border-white/10 shadow-2xl space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1">Slash Commands</div>
              {SLASH_COMMANDS.map((item) => (
                <div
                  key={item.cmd}
                  onClick={() => selectSlashCommand(item.cmd)}
                  className="px-3 py-1.5 rounded-xl text-xs cursor-pointer hover:bg-[#6366F1]/20 text-slate-300 hover:text-white flex items-center justify-between transition-all"
                >
                  <span className="font-mono font-semibold text-[#6366F1]">{item.cmd}</span>
                  <span className="text-slate-400 text-[11px]">{item.desc}</span>
                </div>
              ))}
            </div>
          )}

          {/* Composer Card Surface */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 rounded-2xl bg-[#0E0E14]/90 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-2.5 focus-within:border-[#6366F1]/50 transition-all"
          >
            {/* Top Row Controls inside Floating Composer */}
            <div className="flex items-center justify-between text-xs px-1 border-b border-white/[0.04] pb-2">
              <div className="flex items-center gap-2">
                {/* Model Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span>{selectedModelObj.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showModelDropdown && (
                    <div className="absolute bottom-8 left-0 w-56 p-1.5 rounded-xl bg-[#0F0F18] border border-white/10 shadow-2xl z-50 space-y-1">
                      {AVAILABLE_MODELS.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedModelId(m.id);
                            setShowModelDropdown(false);
                          }}
                          className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                            selectedModelId === m.id
                              ? "bg-[#6366F1]/20 text-white font-semibold"
                              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <div>
                            <div>{m.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{m.badge}</div>
                          </div>
                          {selectedModelId === m.id && <Check className="w-3.5 h-3.5 text-[#6366F1]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all"
                  title="Attach file"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach</span>
                </button>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />

                {/* Slash Trigger Pill */}
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

              {/* RAG Toggle Pill inside Composer */}
              <button
                type="button"
                onClick={() => setUseRag(!useRag)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all border ${
                  useRag ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]" : "bg-white/[0.04] border-white/10 text-slate-500"
                }`}
              >
                RAG: {useRag ? "ON" : "OFF"}
              </button>
            </div>

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1">
                {attachedFiles.map((att, idx) => (
                  <div key={idx} className="px-2.5 py-1 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 text-indigo-300 text-[11px] font-mono flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    <span>{att.name}</span>
                    <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-rose-400 ml-1" aria-label="Remove attachment">
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
                aria-label="Ask AI Assistant"
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
                  aria-label="Stop Generation"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() && attachedFiles.length === 0}
                  className="p-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. Right Collapsible Context Drawer (Hidden by default)*/}
      {/* ---------------------------------------------------- */}
      {showContextDrawer && (
        <div className="w-80 bg-[#09090D] border-l border-white/[0.04] flex flex-col h-full shrink-0 p-5 space-y-5 overflow-y-auto v2-scrollbar z-20">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sliders className="w-4 h-4 text-[#6366F1]" />
              <span>Active Context</span>
            </div>
            <button onClick={() => setShowContextDrawer(false)} aria-label="Close Drawer" className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Workspace */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Current Workspace</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Engineer OS</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">d:\coding\AI-Engineer-OS</div>
            </div>
          </div>

          {/* Attached Documents */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Attached Documents</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-2">
              <div className="text-xs text-slate-300">
                {attachedFiles.length > 0 ? `${attachedFiles.length} files attached` : "No active file attachments"}
              </div>
            </div>
          </div>

          {/* Current Model */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Current Model</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-1 text-xs">
              <div className="font-semibold text-indigo-300">{selectedModelObj.name}</div>
              <div className="text-[10px] font-mono text-slate-500">{selectedModelObj.badge}</div>
            </div>
          </div>

          {/* Vector Store Status */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Vector Store Status</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">RAG Pipeline</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${useRag ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-slate-500"}`}>
                  {useRag ? "ACTIVE" : "PAUSED"}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Files */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Recent Files</div>
            <div className="p-3 rounded-xl bg-[#0E0E14] border border-white/[0.04] space-y-1 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>src/App.jsx</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>src/styles/designTokens.css</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Insertion Toast Notification */}
      {insertedToastId && (
        <div className="fixed bottom-24 right-8 z-50 px-4 py-2.5 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-mono backdrop-blur-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>✓ Code inserted into Studio</span>
        </div>
      )}

      {/* Flagship Autonomous Engineering Task Modal */}
      {showAutonomousWorkflow && (
        <AutonomousTaskWorkflow
          promptText={inputPrompt}
          onClose={() => setShowAutonomousWorkflow(false)}
        />
      )}
    </div>
  );
}

export default AIChatWindow;
