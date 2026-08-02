import React, { useState } from "react";

// =======================================================
// Tabs.jsx
// Reusable Tabs Component
// Props:
//   tabs        - Array of { id, label, icon, badge, content }
//   activeTab   - Currently active tab ID (controlled mode)
//   onChange    - Callback when tab changes (tabId) => void
//   defaultTab  - Initial active tab ID (uncontrolled mode)
//   variant     - "line" | "pills" | "boxed" (default "line")
// =======================================================

function Tabs({
  tabs = [],
  activeTab: controlledActiveTab,
  onChange,
  defaultTab,
  variant = "line",
  className = "",
  style = {},
}) {
  const [internalTab, setInternalTab] = useState(
    defaultTab || (tabs.length > 0 ? tabs[0].id : null)
  );

  const currentTabId = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const handleTabClick = (tabId) => {
    if (controlledActiveTab === undefined) {
      setInternalTab(tabId);
    }
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabItem = tabs.find((t) => t.id === currentTabId);

  return (
    <div className={`tabs-container ${className}`} style={{ width: "100%", ...style }}>
      <div
        className={`tabs-header tabs-variant-${variant}`}
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: variant === "line" ? "1px solid var(--border-subtle)" : "none",
          paddingBottom: variant === "line" ? "2px" : "0",
          overflowX: "auto",
        }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: variant === "pills" ? "6px 14px" : "8px 14px",
                borderRadius: variant === "pills" ? "20px" : variant === "boxed" ? "6px" : "0",
                background:
                  variant === "pills" && isActive
                    ? "var(--accent)"
                    : variant === "boxed" && isActive
                    ? "var(--surface-3)"
                    : "none",
                color:
                  variant === "pills" && isActive
                    ? "var(--text-inverse)"
                    : isActive
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                border: "none",
                borderBottom:
                  variant === "line" && isActive ? "2px solid var(--accent)" : "2px solid transparent",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "500",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-smooth)",
                whiteSpace: "nowrap",
              }}
            >
              {tab.icon && <span style={{ fontSize: "14px" }}>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: isActive ? "var(--accent-muted)" : "var(--surface-3)",
                    color: isActive ? "var(--accent)" : "var(--text-ghost)",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTabItem && activeTabItem.content && (
        <div className="tabs-content" style={{ marginTop: "16px" }} role="tabpanel">
          {activeTabItem.content}
        </div>
      )}
    </div>
  );
}

export default React.memo(Tabs);
