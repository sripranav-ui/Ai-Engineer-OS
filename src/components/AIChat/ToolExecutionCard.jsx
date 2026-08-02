import React from "react";
import { Wrench, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ToolExecutionCard({ toolName = "Tool Execution", status = "COMPLETED", durationMs = 120, args = {} }) {
  return (
    <div className="my-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-300 font-medium">
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Executed Tool: {toolName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          {status === "COMPLETED" && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Success ({durationMs}ms)</span>
            </>
          )}
          {status === "RUNNING" && (
            <>
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-300">Executing...</span>
            </>
          )}
          {status === "FAILED" && (
            <>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-300">Failed</span>
            </>
          )}
        </div>
      </div>
      {args && Object.keys(args).length > 0 && (
        <pre className="mt-2 p-2 rounded bg-slate-900/80 text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
          {JSON.stringify(args, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default ToolExecutionCard;
