import React, { useState } from "react";
import Button from "../Common/Button";
import Badge from "../Common/Badge";
import agentRegistry from "../../services/ai/agents/registry/agentRegistry";
import taskQueue from "../../services/ai/agents/tasks/taskQueue";
import metricsTracker from "../../services/ai/agents/observability/metricsTracker";
import agentOrchestrator from "../../services/ai/agents/orchestrator/agentOrchestrator";

function AgentsDashboardWidget() {
  const [goal, setGoal]                 = useState("");
  const [isRunning, setIsRunning]       = useState(false);
  const [queue, setQueue]               = useState(() => taskQueue.getQueue());
  const [metrics, setMetrics]           = useState(() => metricsTracker.getMetrics());

  const agents = agentRegistry.getAllAgents();

  const handleDispatch = async () => {
    if (!goal.trim() || isRunning) return;
    setIsRunning(true);

    try {
      await agentOrchestrator.dispatchGoal(goal);
      setQueue(taskQueue.getQueue());
      setMetrics(metricsTracker.getMetrics());
      setGoal("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "20px" }}>🤖</span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md)", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Multi-Agent Orchestration Engine
          </h3>
        </div>
        <Badge type="primary">{agents.length} Active Agents</Badge>
      </div>

      {/* Goal Input Form */}
      <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
        <input
          type="text"
          placeholder="e.g. Create new RAG pipeline project and decompose feature tasks..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{ flex: 1, padding: "var(--space-3)", background: "var(--surface-2)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}
        />
        <Button onClick={handleDispatch} type="primary" disabled={isRunning || !goal.trim()}>
          {isRunning ? "🚀 Planning & Executing..." : "Dispatch Task"}
        </Button>
      </div>

      {/* Agents Catalog Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        {agents.map((ag) => (
          <div key={ag.id} style={{ padding: "var(--space-3-5)", background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>{ag.name}</span>
              <Badge type="secondary">{ag.role}</Badge>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: 0 }}>Capabilities: {ag.capabilities.join(", ")}</p>
          </div>
        ))}
      </div>

      {/* Telemetry Metrics */}
      <div style={{ display: "flex", gap: "var(--space-6)", padding: "var(--space-4)", background: "var(--surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
        <div>
          <span style={{ fontSize: "11px", color: "var(--text-ghost)", display: "block" }}>TOTAL TASKS</span>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>{metrics.totalTasks}</span>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "var(--text-ghost)", display: "block" }}>SUCCESS RATE</span>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--success)" }}>{metrics.successRate}%</span>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "var(--text-ghost)", display: "block" }}>AVG LATENCY</span>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--accent)" }}>{metrics.avgDurationMs}ms</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AgentsDashboardWidget);
