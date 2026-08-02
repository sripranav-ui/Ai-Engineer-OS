import React, { useState, useContext, useMemo } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";

export function NotificationCenter({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAll
  } = useContext(NotificationContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredNotices = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        String(n?.title || "").toLowerCase().includes(String(searchQuery || "").toLowerCase()) ||
        String(n?.message || "").toLowerCase().includes(String(searchQuery || "").toLowerCase());

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Unread" && !n.read) ||
        (activeTab === "Achievements" && n.type === "achievement") ||
        (activeTab === "Alerts" && (n.priority === "error" || n.priority === "warning"));

      return matchesSearch && matchesTab;
    });
  }, [notifications, searchQuery, activeTab]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "achievement": return "🏆";
      case "project": return "💻";
      case "learning": return "📚";
      case "planner": return "📅";
      case "career": return "💼";
      default: return "🔔";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "error": return "#ef4444";
      case "warning": return "#f59e0b";
      case "success": return "#10b981";
      default: return "#3b82f6";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "360px",
        height: "100vh",
        background: "var(--surface-1)",
        borderLeft: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-xl)",
        zIndex: 5000,
        display: "flex",
        flexDirection: "column"
      }}
      className="fade-in"
    >
      {/* Header section */}
      <div style={{ padding: "20px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)", fontWeight: "850" }}>🔔 Notification Center</h3>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{unreadCount} unread notices</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontSize: "20px", cursor: "pointer" }}>×</button>
      </div>

      {/* Control panel buttons */}
      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", background: "var(--surface-2)", borderBottom: "1px solid var(--border-subtle)" }}>
        <button onClick={markAllRead} style={{ background: "none", border: "none", color: "var(--accent-gold)", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
          Mark All Read
        </button>
        <button onClick={clearAll} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
          Clear All
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: "12px 20px" }}>
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            background: "var(--surface-1)",
            border: "1px solid var(--border-strong)",
            borderRadius: "6px",
            padding: "8px 12px",
            color: "var(--text-primary)",
            fontSize: "12.5px",
            outline: "none"
          }}
        />
      </div>

      {/* Categories Tabs */}
      <div style={{ display: "flex", gap: "5px", padding: "0 20px 10px", overflowX: "auto" }}>
        {["All", "Unread", "Achievements", "Alerts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "var(--accent)" : "var(--surface-2)",
              color: activeTab === tab ? "var(--text-inverse)" : "var(--text-secondary)",
              border: activeTab === tab ? "none" : "1px solid var(--border-default)",
              borderRadius: "15px",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px" }}>
        {filteredNotices.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredNotices.map((n) => (
              <div
                key={n.id}
                style={{
                  background: n.read ? "var(--surface-2)" : "var(--surface-3)",
                  border: "1px solid var(--border-default)",
                  borderLeft: `4px solid ${getPriorityColor(n.priority)}`,
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  position: "relative",
                  transition: "opacity 0.2s"
                }}
              >
                {/* Upper line metadata */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "14px" }}>{getTypeIcon(n.type)}</span>
                    <strong style={{ fontSize: "12.5px", color: n.read ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                      {n.title}
                    </strong>
                  </div>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-tertiary)",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>

                {/* Description details */}
                <p style={{ margin: 0, fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {n.message}
                </p>

                {/* Footer line Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                  <span style={{ fontSize: "9px", color: "var(--text-tertiary)" }}>
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold)",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      ✓ Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-tertiary)" }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📭</span>
            <span style={{ fontSize: "12.5px" }}>No alerts match your filter options.</span>
          </div>
        )}
      </div>

    </div>
  );
}

export default NotificationCenter;
