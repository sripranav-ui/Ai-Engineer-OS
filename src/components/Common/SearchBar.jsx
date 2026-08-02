import React from "react";

/**
 * Reusable Search Bar Component
 */
function SearchBar({ value, onChange, placeholder = "Search...", onSubmit }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#0c0f19",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "6px 14px",
        gap: "10px",
        flex: 1
      }}
    >
      <span style={{ fontSize: "14px", color: "var(--light-text)" }}>🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          background: "none",
          border: "none",
          outline: "none",
          color: "white",
          fontSize: "13.5px"
        }}
      />
    </div>
  );
}

export default React.memo(SearchBar);
