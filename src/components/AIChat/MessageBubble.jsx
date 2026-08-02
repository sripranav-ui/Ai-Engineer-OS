import React from "react";
import MarkdownRenderer from "./MarkdownRenderer.jsx";
import ThinkingIndicator from "./ThinkingIndicator.jsx";
import ToolExecutionCard from "./ToolExecutionCard.jsx";
import WorkflowExecutionCard from "./WorkflowExecutionCard.jsx";
import AgentExecutionCard from "./AgentExecutionCard.jsx";
import MemoryCard from "./MemoryCard.jsx";
import CitationCard from "./CitationCard.jsx";
import MessageActions from "./MessageActions.jsx";
import FileAttachment from "./FileAttachment.jsx";
import { User, Bot } from "lucide-react";

export function MessageBubble({ message, isGenerating, onRegenerate, onStop, onEdit }) {
  const isUser = message.sender === "user";

  return (
    <div className={`group flex gap-3 my-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-indigo-600 text-white" : "bg-slate-800 border border-slate-700 text-indigo-400"}`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${isUser ? "bg-indigo-600 text-white" : "bg-slate-900/90 border border-slate-800 text-slate-100"}`}>
        {/* Attachments */}
        {message.attachments && <FileAttachment files={message.attachments} />}

        {/* Thinking Indicator */}
        {!isUser && message.thoughtProcess && <ThinkingIndicator thoughtProcess={message.thoughtProcess} />}

        {/* Visual Execution Cards */}
        {!isUser && message.toolExecution && <ToolExecutionCard {...message.toolExecution} />}
        {!isUser && message.workflowExecution && <WorkflowExecutionCard {...message.workflowExecution} />}
        {!isUser && message.agentExecution && <AgentExecutionCard {...message.agentExecution} />}
        {!isUser && message.memoryContext && <MemoryCard {...message.memoryContext} />}

        {/* Text Content */}
        <MarkdownRenderer content={message.text || ""} />

        {/* Citations */}
        {!isUser && message.ragChunks && <CitationCard chunks={message.ragChunks} />}

        {/* Action Controls */}
        <MessageActions
          content={message.text}
          isGenerating={isGenerating}
          onRegenerate={!isUser ? onRegenerate : undefined}
          onStop={isGenerating ? onStop : undefined}
          onEdit={isUser ? onEdit : undefined}
        />
      </div>
    </div>
  );
}

export default MessageBubble;
