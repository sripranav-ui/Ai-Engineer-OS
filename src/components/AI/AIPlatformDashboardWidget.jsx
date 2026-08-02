import React, { useState } from "react";
import Button from "../Common/Button";
import Badge from "../Common/Badge";
import modelRegistry from "../../services/ai/orchestration/registry/modelRegistry";
import providerRegistry from "../../services/ai/orchestration/registry/providerRegistry";

function AIPlatformDashboardWidget() {
  const [selectedTaskScope, setSelectedTaskScope] = useState("coding");

  const models = modelRegistry.getAllModels();
  const providers = providerRegistry.getAllProviders();

  return (
    <div style={{ background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "20px" }}>🧠</span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-md)", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Multi-LLM Orchestration Platform
          </h3>
        </div>
        <Badge type="success">{providers.length} Providers Connected</Badge>
      </div>

      {/* Models Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
        {models.map((m) => (
          <div key={m.id} style={{ padding: "var(--space-4)", background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>{m.name}</span>
              <Badge type="primary" style={{ fontSize: "10px" }}>{m.providerId}</Badge>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: "0 0 8px 0" }}>
              Context: {(m.contextWindow / 1000).toFixed(0)}k tokens
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {m.capabilities.map((cap) => (
                <span key={cap} style={{ fontSize: "10px", padding: "1px 6px", background: "var(--surface-3)", borderRadius: "4px", color: "var(--text-secondary)" }}>
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(AIPlatformDashboardWidget);
