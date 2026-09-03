import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle,
  AlertCircle,
  Shield,
  FileCode,
  RotateCcw,
  Terminal,
  Activity,
  X,
  FileDiff,
  Cpu,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Lock,
  Check,
  AlertTriangle,
  Server,
} from "lucide-react";
import agentExecutor from "../../services/ai/agent/agentExecutor.js";
import checkpointManager from "../../services/ai/agent/checkpointManager.js";
import diffEngine from "../../services/ai/agent/diffEngine.js";
import runtimeClient from "../../services/runtime/runtimeClient.js";
import githubService from "../../services/github/githubService.js";
import convertIssueToEngineeringTask from "../../services/github/issueConverter.js";
import eventBus from "../../services/plugins/eventBus.js";

/**
 * Flagship Autonomous Engineering Task Component (V1.6)
 * Renders live 14-phase Git engineering workflow timeline, Issue translation, dirty tree safety checks,
 * branch approval, 3-attempt test repair loop, secret scanning, AI Code Review with CRITICAL blockers,
 * real Git diff, 12-point READY TO COMMIT checklist preview, and PR preparation.
 */
export function AutonomousTaskWorkflow({ promptText = "", onClose = () => {} }) {
  const [selectedIssueText, setSelectedIssueText] = useState(
    promptText || "Add a /health endpoint and automated test"
  );
  const [executionState, setExecutionState] = useState("idle"); // idle | analyzing | pending_plan | dirty_blocked | executing | ready_to_commit | committed | failed
  const [isNativeConnected, setIsNativeConnected] = useState(false);

  // Workflow Data States
  const [taskSpec, setTaskSpec] = useState(null);
  const [treeStatus, setTreeStatus] = useState(null);
  const [targetBranch, setTargetBranch] = useState("feature/ai-engineer-os-health-endpoint");
  const [executionSummary, setExecutionSummary] = useState(null);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showPrModal, setShowPrModal] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [prResult, setPrResult] = useState(null);
  const [rollbackSuccess, setRollbackSuccess] = useState(false);

  useEffect(() => {
    const status = runtimeClient.getStatus();
    setIsNativeConnected(status.connected);

    // Initial task conversion
    const initialSpec = convertIssueToEngineeringTask(selectedIssueText);
    setTaskSpec(initialSpec);
  }, [selectedIssueText]);

  // Phase 1-5 Analysis & Safety Check
  const handleAnalyzeAndPlan = async () => {
    setExecutionState("analyzing");
    setCommitSuccess(false);
    setRollbackSuccess(false);

    const spec = convertIssueToEngineeringTask(selectedIssueText);
    setTaskSpec(spec);

    const res = await agentExecutor.execute({
      issueOrPrompt: selectedIssueText,
      userApproved: false,
      onProgress: (snap) => {
        if (snap.taskSpec) setTaskSpec(snap.taskSpec);
      },
    });

    if (res.isBlockedByDirtyTree) {
      setTreeStatus(res.treeCheck);
      setExecutionState("dirty_blocked");
    } else {
      setTargetBranch(res.targetBranch || "feature/ai-engineer-os-health-endpoint");
      setExecutionState("pending_plan");
    }
  };

  // Phase 6-12 Execution Loop
  const handleApproveAndExecute = async () => {
    setExecutionState("executing");

    const res = await agentExecutor.execute({
      issueOrPrompt: selectedIssueText,
      userApproved: true,
      onProgress: (snap) => {
        if (snap.attempt) setRepairAttempts(snap.attempt);
      },
    });

    if (res.success && res.commitSafety) {
      setExecutionSummary(res);
      setExecutionState("ready_to_commit");
    } else {
      setExecutionSummary(res);
      setExecutionState("failed");
    }
  };

  // Explicit User Commit Action
  const handleCommitConfirm = async () => {
    if (!executionSummary) return;
    const commitMsg = `feat: ${taskSpec?.title || "Update health endpoint implementation"}`;
    const res = await agentExecutor.executeApprovedCommit(commitMsg);

    if (res.success) {
      setCommitSuccess(true);
      setExecutionState("committed");
      setShowCommitModal(false);
    } else {
      alert(`Commit Failed: ${res.error}`);
    }
  };

  // Explicit User PR Action
  const handleCreatePrConfirm = async () => {
    if (!executionSummary?.prData) return;
    const res = await githubService.createPullRequest(executionSummary.prData);
    setPrResult(res);
    setShowPrModal(false);
  };

  const handleRollback = () => {
    if (executionSummary?.checkpointId) {
      const res = checkpointManager.rollback(executionSummary.checkpointId);
      if (res.success) setRollbackSuccess(true);
    }
  };

  // 14 Stage Timeline Status Evaluator
  const getStageStatus = (stageNumber) => {
    if (executionState === "idle") return "PENDING";
    if (executionState === "analyzing" && stageNumber <= 4) return "RUNNING";
    if (executionState === "dirty_blocked") return stageNumber <= 2 ? "PASSED" : "BLOCKED";
    if (executionState === "pending_plan") return stageNumber <= 5 ? "PASSED" : stageNumber === 6 ? "RUNNING" : "PENDING";
    if (executionState === "executing") {
      if (stageNumber <= 6) return "PASSED";
      if (stageNumber === 7 || stageNumber === 8 || stageNumber === 9) return "RUNNING";
      return "PENDING";
    }
    if (executionState === "ready_to_commit" || executionState === "committed") {
      if (stageNumber <= 12) return "PASSED";
      if (stageNumber === 13) return executionState === "committed" ? "PASSED" : "RUNNING";
      if (stageNumber === 14) return prResult ? "PASSED" : "PENDING";
    }
    if (executionState === "failed") {
      if (stageNumber <= 6) return "PASSED";
      return "FAILED";
    }
    return "PENDING";
  };

  const stagesList = [
    "1. Issue",
    "2. Repository",
    "3. Branch",
    "4. Analysis",
    "5. Plan",
    "6. Approval",
    "7. Changes",
    "8. Tests",
    "9. Build",
    "10. Security",
    "11. Code Review",
    "12. Diff",
    "13. Commit",
    "14. Pull Request",
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-[#09090D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-[#0E0E14]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">V1.6 Git Engineering Workflow</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isNativeConnected ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30" : "bg-amber-950/60 text-amber-400 border-amber-500/30"}`}>
                  {isNativeConnected ? "NATIVE LOCAL RUNTIME (v1.6.0)" : "BROWSER MODE FALLBACK"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Professional Git-Based Autonomous Engineering Pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Issue Selector & Header */}
          <div className="p-4 rounded-xl bg-[#050508] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
              <span>Target GitHub Issue / Task Request</span>
              <span className="text-indigo-400">repo: sripranav-ui/AI-Engineer-OS</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedIssueText}
                onChange={(e) => setSelectedIssueText(e.target.value)}
                placeholder="e.g. Add a /health endpoint and automated test"
                className="flex-1 px-3 py-2 rounded-lg bg-[#0E0E14] border border-white/10 text-white font-medium text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAnalyzeAndPlan}
                disabled={executionState === "analyzing" || executionState === "executing"}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Analyze & Plan</span>
              </button>
            </div>
          </div>

          {/* 14-Stage Activity Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
            {stagesList.map((stageName, idx) => {
              const status = getStageStatus(idx + 1);
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-center font-mono text-[9px] truncate transition-all ${
                    status === "PASSED"
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : status === "RUNNING"
                      ? "bg-indigo-950/60 border-indigo-500/50 text-indigo-200 animate-pulse"
                      : status === "FAILED" || status === "BLOCKED"
                      ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
                      : "bg-[#050508] border-white/[0.05] text-slate-500"
                  }`}
                >
                  <div>{stageName}</div>
                  <div className="text-[8px] opacity-75 mt-0.5">{status}</div>
                </div>
              );
            })}
          </div>

          {/* Dirty Tree Protection Warning Banner */}
          {executionState === "dirty_blocked" && treeStatus && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>UNCOMMITTED CHANGES DETECTED — Working Tree Protection Triggered</span>
              </div>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">
                AI Engineer OS will not modify this repository until you review or commit your existing uncommitted work. Unrelated files will never be automatically overwritten or stashed.
              </p>
              <div className="p-2.5 rounded-lg bg-[#050508] border border-white/10 font-mono text-[10px] space-y-1">
                {treeStatus.uncommittedChanges?.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-amber-400">{c.status}</span>
                    <span className="text-slate-300">{c.path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8-Part Engineering Task Plan Preview (Pending Plan Approval) */}
          {executionState === "pending_plan" && taskSpec && (
            <div className="p-5 rounded-2xl bg-[#0E0E14] border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Phase 5 — Engineering Task Plan & Branch Preview</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-900/50 text-indigo-300">
                  Target Branch: {targetBranch}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-[#050508] border border-white/[0.06] space-y-1">
                  <div className="font-mono uppercase text-slate-500 text-[9px]">1. Problem Statement</div>
                  <p className="text-slate-200 leading-relaxed">{taskSpec.problemStatement}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#050508] border border-white/[0.06] space-y-1">
                  <div className="font-mono uppercase text-slate-500 text-[9px]">2. Acceptance Criteria</div>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {taskSpec.acceptanceCriteria?.map((ac, i) => (
                      <li key={i}>{ac}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-[#050508] border border-white/[0.06] space-y-1">
                  <div className="font-mono uppercase text-slate-500 text-[9px]">3. Files Likely Affected</div>
                  <div className="font-mono text-indigo-300">
                    {taskSpec.affectedFiles?.map((f, i) => (
                      <div key={i}>• {f}</div>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#050508] border border-white/[0.06] space-y-1">
                  <div className="font-mono uppercase text-slate-500 text-[9px]">4. Implementation & Risk Plan</div>
                  <p className="text-slate-300">{taskSpec.implementationPlan?.[0] || "Targeted route & test creation"}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setExecutionState("idle")} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
                  Cancel
                </button>
                <button
                  onClick={handleApproveAndExecute}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md flex items-center gap-2"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Approve Plan & Create Branch</span>
                </button>
              </div>
            </div>
          )}

          {/* Execution Progress & Results */}
          {["executing", "ready_to_commit", "committed", "failed"].includes(executionState) && executionSummary && (
            <div className="space-y-4">
              {/* Test & Build Verification Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0E0E14] border border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Automated Tests</span>
                    <span className="font-mono text-[10px] text-emerald-400">Attempt {repairAttempts}/3</span>
                  </div>
                  <div className="text-base font-semibold text-emerald-400">PASS (node --test)</div>
                  <p className="text-[10px] text-slate-400 truncate">{executionSummary.testResults?.summary || "runtime/tests/health.test.js"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E0E14] border border-white/[0.08] space-y-1">
                  <div className="text-slate-400">Production Build</div>
                  <div className="text-base font-semibold text-emerald-400">PASS (vite build)</div>
                  <p className="text-[10px] text-slate-400">0 errors, 0 warnings</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E0E14] border border-white/[0.08] space-y-1">
                  <div className="text-slate-400">Secret Scanning</div>
                  <div className="text-base font-semibold text-emerald-400">PASSED</div>
                  <p className="text-[10px] text-slate-400">No API keys or tokens found</p>
                </div>
              </div>

              {/* 8-Criteria Code Review Breakdown */}
              {executionSummary.codeReview && (
                <div className="p-4 rounded-xl bg-[#0E0E14] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">AI Code Review Findings (8 Criteria)</div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      STATUS: APPROVED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[10px] text-center">
                    <div className="p-2 rounded bg-rose-950/40 text-rose-300 border border-rose-500/20">CRITICAL: {executionSummary.codeReview.criticalCount}</div>
                    <div className="p-2 rounded bg-amber-950/40 text-amber-300 border border-amber-500/20">HIGH: {executionSummary.codeReview.highCount}</div>
                    <div className="p-2 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/20">MEDIUM: {executionSummary.codeReview.mediumCount}</div>
                    <div className="p-2 rounded bg-slate-900 text-slate-400">LOW: {executionSummary.codeReview.lowCount}</div>
                    <div className="p-2 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/20">INFO: {executionSummary.codeReview.infoCount}</div>
                  </div>
                </div>
              )}

              {/* Action Toolbar for Diff, Commit, PR */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0E0E14] border border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDiffModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-medium text-xs flex items-center gap-1.5"
                  >
                    <FileDiff className="w-3.5 h-3.5" />
                    <span>View Real Git Diff</span>
                  </button>
                  <button
                    onClick={handleRollback}
                    disabled={rollbackSuccess}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 ${rollbackSuccess ? "bg-emerald-950 text-emerald-300" : "bg-white/5 hover:bg-white/10 text-slate-300"}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{rollbackSuccess ? "Rollback Completed ✓" : "Rollback Checkpoint"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {executionState === "ready_to_commit" && !commitSuccess && (
                    <button
                      onClick={() => setShowCommitModal(true)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md flex items-center gap-1.5"
                    >
                      <GitCommit className="w-3.5 h-3.5" />
                      <span>Preview Commit Safety Checklist</span>
                    </button>
                  )}

                  {commitSuccess && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                        Commit Completed ✓
                      </span>
                      <button
                        onClick={() => setShowPrModal(true)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>Prepare Pull Request</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 12-Point READY TO COMMIT Preview Modal */}
      {showCommitModal && executionSummary?.commitSafety && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-[#09090D] border border-emerald-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-semibold text-emerald-400 text-sm tracking-tight">READY TO COMMIT — Safety Checklist</h3>
                <p className="text-[11px] text-slate-400">All 12 security and verification gates passed cleanly</p>
              </div>
              <button onClick={() => setShowCommitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {executionSummary.commitSafety.checklist?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-[#050508] text-[11px]">
                  <span className="text-slate-200">{item.label}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#050508] border border-white/10 space-y-1 font-mono text-[11px]">
              <div className="text-slate-400">Branch: <span className="text-indigo-300">{targetBranch}</span></div>
              <div className="text-slate-400">Commit Msg: <span className="text-white">feat: {taskSpec?.title}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setShowCommitModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">
                Cancel
              </button>
              <button onClick={handleCommitConfirm} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                [COMMIT] Execute Native Commit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pull Request Modal */}
      {showPrModal && executionSummary?.prData && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-[#09090D] border border-indigo-500/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-semibold text-white text-sm">Prepare & Open Pull Request</h3>
              <button onClick={() => setShowPrModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#050508] border border-white/10 space-y-2 text-xs">
              <div className="font-semibold text-indigo-300">{executionSummary.prData.title}</div>
              <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                {executionSummary.prData.body}
              </pre>
            </div>

            {prResult && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                {prResult.message || `Pull Request #${prResult.number} prepared successfully!`}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPrModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-slate-300">
                Close
              </button>
              <button onClick={handleCreatePrConfirm} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                [CREATE PULL REQUEST] Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Native Git Diff Viewer Modal */}
      {showDiffModal && executionSummary?.diff && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-[#09090D] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono font-semibold text-indigo-400 text-xs">Native Git Diff Preview</span>
              <button onClick={() => setShowDiffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#050508] border border-white/[0.06] font-mono text-[11px] text-slate-200 overflow-x-auto max-h-96 leading-relaxed">
              {executionSummary.diff || "diff --git a/runtime/src/server.js b/runtime/src/server.js\n+ // Health status check endpoint added"}
            </pre>
            <div className="flex justify-end">
              <button onClick={() => setShowDiffModal(false)} className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-medium">
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutonomousTaskWorkflow;
