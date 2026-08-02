import React, { useState, useEffect, useMemo } from "react";
import { monitoringService, LogCategory } from "../../services/monitoringService";
import Button from "./Button";
import Card from "./Card";

export function DeveloperConsole({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debugEnabled, setDebugEnabled] = useState(monitoringService.debugMode);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Poll for logs updating on open/close
  useEffect(() => {
    if (isOpen) {
      setLogs(monitoringService.getLogs());
      const interval = setInterval(() => {
        setLogs(monitoringService.getLogs());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        String(log?.message || "").toLowerCase().includes(String(searchQuery || "").toLowerCase()) ||
        String(log?.category || "").toLowerCase().includes(String(searchQuery || "").toLowerCase());

      const matchesCategory =
        activeCategory === "All" || log.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [logs, activeCategory, searchQuery]);

  const handleToggleDebug = (e) => {
    const val = e.target.checked;
    setDebugEnabled(val);
    monitoringService.toggleDebugMode(val);
  };

  const triggerMockError = () => {
    monitoringService.error("Simulated system diagnostic error triggered.", {
      code: "DIAG_503",
      timestamp: Date.now(),
      trace: "Error at DeveloperConsole.jsx:45"
    });
  };

  const triggerMockPerformance = () => {
    monitoringService.perf("Simulated compilation latency delay: 450ms", {
      loader: "Vite dev server",
      target: "src/main.jsx"
    });
  };

  const triggerMockAction = () => {
    monitoringService.activity("User visited career dashboard diagnostics", {
      path: "/career-coach",
      userId: "user_mock_123"
    });
  };

  const getLogColor = (cat) => {
    switch (cat) {
      case LogCategory.ERROR: return "#f87171";
      case LogCategory.API: return "#fbbf24";
      case LogCategory.PERFORMANCE: return "#34d399";
      case LogCategory.USER_ACTIVITY: return "#c084fc";
      default: return "#60a5fa";
    }
  };

  // Keyboard shortcut Ctrl+Alt+D to toggle
  useEffect(() => {
    const handleKeyToggle = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyToggle);
    return () => window.removeEventListener("keydown", handleKeyToggle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "450px",
        height: "100vh",
        background: "var(--surface-1)",
        borderRight: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-xl)",
        zIndex: 5050,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-mono)",
        fontSize: "11px"
      }}
      className="fade-in"
    >
      {/* Header */}
      <div style={{ padding: "20px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", fontWeight: "800" }}>💻 Telemetry Console</h3>
          <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Internal monitoring diagnostic dashboard</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontSize: "18px", cursor: "pointer" }}>×</button>
      </div>

      {/* Diagnostics tools generator */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-2)" }}>
        <span style={{ display: "block", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "bold" }}>SIMULATE TELEMETRY EVENTS:</span>
        <div style={{ display: "flex", gap: "6px" }}>
          <Button onClick={triggerMockError} type="outline" style={{ fontSize: "9px", padding: "4px 8px" }}>💥 Error</Button>
          <Button onClick={triggerMockPerformance} type="outline" style={{ fontSize: "9px", padding: "4px 8px" }}>⚡ Perf</Button>
          <Button onClick={triggerMockAction} type="outline" style={{ fontSize: "9px", padding: "4px 8px" }}>👤 Action</Button>
        </div>
      </div>

      {/* Settings tools line */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <input type="checkbox" checked={debugEnabled} onChange={handleToggleDebug} />
          <span>Enable Debug Logs Mode</span>
        </label>
        <button
          onClick={() => {
            monitoringService.clearLogs();
            setLogs([]);
          }}
          style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "10px", textDecoration: "underline" }}
        >
          Clear Logs
        </button>
      </div>

      {/* Query Search filters */}
      <div style={{ padding: "12px 20px" }}>
        <input
          type="text"
          placeholder="Filter telemetry logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            background: "var(--surface-1)",
            border: "1px solid var(--border-strong)",
            borderRadius: "4px",
            padding: "6px 10px",
            color: "var(--text-primary)",
            fontSize: "11px",
            outline: "none"
          }}
        />
      </div>

      {/* Categories Tabs pills */}
      <div style={{ display: "flex", gap: "4px", padding: "0 20px 10px", overflowX: "auto" }}>
        {["All", "APPLICATION", "USER_ACTIVITY", "PERFORMANCE", "API", "ERROR"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? "var(--accent)" : "var(--surface-2)",
              color: activeCategory === cat ? "var(--text-inverse)" : "var(--text-secondary)",
              border: activeCategory === cat ? "none" : "1px solid var(--border-default)",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "9px",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Logs Scroll container */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px" }}>
        {filteredLogs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  borderBottom: "1px solid var(--divider)",
                  paddingBottom: "6px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-tertiary)", fontSize: "9px" }}>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span style={{ color: getLogColor(log.category) }}>{log.category}</span>
                </div>
                <div style={{ color: "var(--text-primary)", marginTop: "2px", lineHeight: "1.4", wordBreak: "break-all" }}>
                  {log.message}
                </div>
                {log.metadata && (
                  <div style={{ marginTop: "4px" }}>
                    <button
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                      style={{ background: "none", border: "none", color: "var(--accent-gold)", fontSize: "9px", cursor: "pointer", padding: 0 }}
                    >
                      {expandedLogId === log.id ? "[-] Hide Details" : "[+] Show Details"}
                    </button>
                    {expandedLogId === log.id && (
                      <pre
                        style={{
                          margin: "4px 0 0",
                          padding: "6px",
                          background: "var(--surface-3)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "4px",
                          color: "var(--text-secondary)",
                          overflowX: "auto",
                          fontSize: "9px"
                        }}
                      >
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-tertiary)" }}>
            <span>No matching logs found.</span>
          </div>
        )}
      </div>

      {/* Footer shortcut tags */}
      <div style={{ padding: "12px 18px", background: "var(--surface-2)", borderTop: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", color: "var(--text-tertiary)" }}>
        <span>Toggle console with Ctrl+Alt+D</span>
      </div>
    </div>
  );
}

export default DeveloperConsole;
