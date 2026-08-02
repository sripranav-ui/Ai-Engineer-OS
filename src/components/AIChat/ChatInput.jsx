import React, { useState, useRef } from "react";
import { Send, Paperclip, Image, Square } from "lucide-react";
import FileAttachment from "./FileAttachment.jsx";

export function ChatInput({ onSend, isGenerating, onStop }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!text.trim() && files.length === 0) || isGenerating) return;
    onSend({ text, attachments: files });
    setText("");
    setFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files).map((f) => ({ name: f.name, size: f.size, type: f.type }));
    setFiles((prev) => [...prev, ...uploaded]);
  };

  return (
    <form onSubmit={handleSubmit} className="relative rounded-2xl border border-slate-700/60 bg-slate-900/90 p-3 shadow-xl focus-within:border-indigo-500 transition-colors">
      <FileAttachment files={files} onRemove={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything, trigger a workflow, or delegate a goal..."
        rows={2}
        className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Image className="w-4 h-4" />
          </button>
        </div>

        {isGenerating ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim() && files.length === 0}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}

export default ChatInput;
