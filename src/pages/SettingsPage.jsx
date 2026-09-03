import React, { useContext, useState, useId } from "react";
import AppContext from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";
import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Input from "../components/Common/Input";
import Badge from "../components/Common/Badge";
import useDocumentMetadata from "../hooks/useDocumentMetadata";
import providerManager from "../services/ai/providers/providerManager.js";
import ragManager from "../services/ai/rag/ragManager.js";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, Cpu, Database } from "lucide-react";

// =======================================================
// SettingsPage.jsx — System Preferences (Version 2 Redesign)
// Clean settings layout with sections.
// =======================================================

function SettingsPage() {
  const {
    currentDay,
    setCurrentDay,
    profileName: globalName,
    setProfileName: setGlobalName,
    profileBio: globalBio,
    setProfileBio: setGlobalBio,
    roadmap,
  } = useContext(AppContext);
  const bioInputId = useId();
  const remindersCheckId = useId();
  const soundCheckId = useId();

  useDocumentMetadata("Settings", "Configure your AI Engineer OS preferences.");

  // RAG Settings State
  const initialRagSettings = ragManager.getSettings();
  const [ragChunkSize, setRagChunkSize] = useState(initialRagSettings.chunkSize || 500);
  const [ragChunkOverlap, setRagChunkOverlap] = useState(initialRagSettings.chunkOverlap || 100);
  const [ragTopK, setRagTopK] = useState(initialRagSettings.topK || 4);
  const [ragThreshold, setRagThreshold] = useState(initialRagSettings.similarityThreshold || 0.15);
  const [ragAutoIndex, setRagAutoIndex] = useState(initialRagSettings.autoIndex !== false);

  const handleSaveRagSettings = (e) => {
    e.preventDefault();
    ragManager.saveSettings({
      chunkSize: Number(ragChunkSize),
      chunkOverlap: Number(ragChunkOverlap),
      topK: Number(ragTopK),
      similarityThreshold: Number(ragThreshold),
      autoIndex: ragAutoIndex,
    });
    alert("Local RAG Engine settings saved successfully!");
  };

  // AI Provider State
  const [selectedProviderTab, setSelectedProviderTab] = useState("openai");

  // OpenAI
  const openAIConfig = providerManager.getProviderConfig("openai") || { enabled: true, apiKey: "", selectedModel: "gpt-4o" };
  const [openAIEnabled, setOpenAIEnabled] = useState(openAIConfig.enabled);
  const [openAIApiKey, setOpenAIApiKey] = useState(openAIConfig.apiKey);
  const [openAIModel, setOpenAIModel] = useState(openAIConfig.selectedModel || "gpt-4o");

  // Gemini
  const geminiConfig = providerManager.getProviderConfig("gemini") || { enabled: false, apiKey: "", selectedModel: "gemini-2.5-flash" };
  const [geminiEnabled, setGeminiEnabled] = useState(geminiConfig.enabled);
  const [geminiApiKey, setGeminiApiKey] = useState(geminiConfig.apiKey);
  const [geminiModel, setGeminiModel] = useState(geminiConfig.selectedModel || "gemini-2.5-flash");

  // Anthropic
  const anthropicConfig = providerManager.getProviderConfig("anthropic") || { enabled: false, apiKey: "", selectedModel: "claude-3-7-sonnet" };
  const [anthropicEnabled, setAnthropicEnabled] = useState(anthropicConfig.enabled);
  const [anthropicApiKey, setAnthropicApiKey] = useState(anthropicConfig.apiKey);
  const [anthropicModel, setAnthropicModel] = useState(anthropicConfig.selectedModel || "claude-3-7-sonnet");

  // Ollama
  const ollamaConfig = providerManager.getProviderConfig("ollama") || { enabled: false, baseUrl: "http://localhost:11434", selectedModel: "llama3" };
  const [ollamaEnabled, setOllamaEnabled] = useState(ollamaConfig.enabled);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(ollamaConfig.baseUrl || "http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState(ollamaConfig.selectedModel || "llama3");

  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const handleSaveProvider = (providerName) => {
    if (providerName === "openai") {
      providerManager.saveProviderConfig("openai", { enabled: openAIEnabled, apiKey: openAIApiKey, selectedModel: openAIModel });
    } else if (providerName === "gemini") {
      providerManager.saveProviderConfig("gemini", { enabled: geminiEnabled, apiKey: geminiApiKey, selectedModel: geminiModel });
    } else if (providerName === "anthropic") {
      providerManager.saveProviderConfig("anthropic", { enabled: anthropicEnabled, apiKey: anthropicApiKey, selectedModel: anthropicModel });
    } else if (providerName === "ollama") {
      providerManager.saveProviderConfig("ollama", { enabled: ollamaEnabled, baseUrl: ollamaBaseUrl, selectedModel: ollamaModel });
    }
    providerManager.setActiveProvider(providerName);
    alert(`${providerName.toUpperCase()} Settings saved successfully & set as active provider!`);
  };

  const handleTestConnection = async (providerName) => {
    setTestStatus({ type: "testing", message: `Testing connection to ${providerName}...` });
    let keyOrUrl = "";
    if (providerName === "openai") keyOrUrl = openAIApiKey;
    if (providerName === "gemini") keyOrUrl = geminiApiKey;
    if (providerName === "anthropic") keyOrUrl = anthropicApiKey;
    if (providerName === "ollama") keyOrUrl = ollamaBaseUrl;

    const res = await providerManager.validateKey(providerName, keyOrUrl);
    if (res.success) {
      setTestStatus({ type: "success", message: res.message || "Connected successfully!" });
    } else {
      setTestStatus({ type: "error", message: res.error || "Connection test failed." });
    }
  };

  // Profile
  const [profileName, setProfileName] = useState(globalName);
  const [profileBio, setProfileBio] = useState(globalBio);

  const saveProfile = (e) => {
    e.preventDefault();
    setGlobalName(profileName);
    setGlobalBio(profileBio);
    alert("Profile saved successfully!");
  };

  // Data Backup
  const exportData = () => {
    const data = JSON.stringify(localStorage);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(data);
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", "ai-engineer-os-backup.json");
    link.click();
  };

  return (
    <div className="h-full w-full bg-[#09090b] text-slate-100 p-8 overflow-y-auto font-sans v2-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Preferences</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure AI Providers, RAG engine, user profile, and data backups</p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-mono font-semibold">
          Active AI Provider: {providerManager.getActiveProviderName().toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Providers & RAG Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Provider Configuration */}
          <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Providers Configuration</h3>
              </div>
            </div>

            {/* Provider Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#09090b] border border-white/10 rounded-lg">
              {[
                { id: "openai", name: "OpenAI" },
                { id: "gemini", name: "Gemini" },
                { id: "anthropic", name: "Claude" },
                { id: "ollama", name: "Ollama" },
                { id: "github", name: "GitHub (V1.6)" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProviderTab(p.id);
                    setTestStatus(null);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all ${
                    selectedProviderTab === p.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* GitHub Integration Form (V1.6) */}
            {selectedProviderTab === "github" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">GitHub Integration (In-Memory Session Auth)</div>
                    <div className="text-[11px] text-slate-400">Tokens exist only in active session memory (never in localStorage or disk)</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-900/50 text-indigo-300 border border-indigo-500/30">
                    Token: [REDACTED]
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">GitHub Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    placeholder="ghp_... or github_pat_..."
                    onChange={(e) => {
                      githubService.setToken(e.target.value);
                    }}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Security Note: Token is held strictly in memory for the active session and will be cleared when closed.
                  </p>
                </div>
              </div>
            )}

            {/* OpenAI Form */}
            {selectedProviderTab === "openai" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">OpenAI Provider</div>
                    <div className="text-[11px] text-slate-400">GPT-5.5, GPT-5 Mini, GPT-4.1, GPT-4o</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={openAIEnabled}
                    onChange={(e) => setOpenAIEnabled(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">OpenAI API Key</label>
                  <div className="relative flex items-center">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={openAIApiKey}
                      onChange={(e) => setOpenAIApiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    />
                    <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 text-slate-400 hover:text-white">
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => handleTestConnection("openai")} type="outline">Test Connection</Button>
                  <Button onClick={() => handleSaveProvider("openai")} type="primary">Save OpenAI Settings</Button>
                </div>
              </div>
            )}

            {/* Gemini Form */}
            {selectedProviderTab === "gemini" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Google Gemini Provider</div>
                    <div className="text-[11px] text-slate-400">Gemini 2.5 Pro & Gemini 2.5 Flash</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={geminiEnabled}
                    onChange={(e) => setGeminiEnabled(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Gemini API Key</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => handleTestConnection("gemini")} type="outline">Test Connection</Button>
                  <Button onClick={() => handleSaveProvider("gemini")} type="primary">Save Gemini Settings</Button>
                </div>
              </div>
            )}

            {/* Anthropic Form */}
            {selectedProviderTab === "anthropic" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Anthropic Claude Provider</div>
                    <div className="text-[11px] text-slate-400">Claude 3.7 Sonnet & Opus</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={anthropicEnabled}
                    onChange={(e) => setAnthropicEnabled(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Claude API Key</label>
                  <input
                    type="password"
                    value={anthropicApiKey}
                    onChange={(e) => setAnthropicApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => handleTestConnection("anthropic")} type="outline">Test Connection</Button>
                  <Button onClick={() => handleSaveProvider("anthropic")} type="primary">Save Claude Settings</Button>
                </div>
              </div>
            )}

            {/* Ollama Form */}
            {selectedProviderTab === "ollama" && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Local Ollama Provider</div>
                    <div className="text-[11px] text-slate-400">Offline Local Models</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ollamaEnabled}
                    onChange={(e) => setOllamaEnabled(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Base Endpoint URL</label>
                  <input
                    type="text"
                    value={ollamaBaseUrl}
                    onChange={(e) => setOllamaBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => handleTestConnection("ollama")} type="outline">Test Connection</Button>
                  <Button onClick={() => handleSaveProvider("ollama")} type="primary">Save Ollama Settings</Button>
                </div>
              </div>
            )}

            {testStatus && (
              <div className={`p-3 rounded-lg text-xs font-mono border ${testStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                {testStatus.message}
              </div>
            )}
          </div>

          {/* RAG Engine Settings */}
          <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Local RAG Engine Configuration</h3>
              </div>
            </div>

            <form onSubmit={handleSaveRagSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Chunk Size (chars)</label>
                  <input
                    type="number"
                    value={ragChunkSize}
                    onChange={(e) => setRagChunkSize(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Chunk Overlap (chars)</label>
                  <input
                    type="number"
                    value={ragChunkOverlap}
                    onChange={(e) => setRagChunkOverlap(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Top-K Results</label>
                  <input
                    type="number"
                    value={ragTopK}
                    onChange={(e) => setRagTopK(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Similarity Threshold</label>
                  <input
                    type="number"
                    step="0.05"
                    value={ragThreshold}
                    onChange={(e) => setRagThreshold(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="primary">Save RAG Settings</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: User Profile & Data Backups */}
        <div className="lg:col-span-5 space-y-6">
          {/* User Profile */}
          <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">User Profile</h3>

            <form onSubmit={saveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Bio / Role</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={3}
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button type="primary">Save Profile</Button>
              </div>
            </form>
          </div>

          {/* Backup & System Restore */}
          <div className="p-6 rounded-xl bg-[#121218] border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.06] pb-3">Data Backup & Export</h3>
            <p className="text-xs text-slate-400">Export or restore your local workspace state JSON package:</p>

            <div className="flex gap-3">
              <Button onClick={exportData} type="outline">Export Local Backup JSON</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;