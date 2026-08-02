import React from "react";
import Button from "./Button";

/**
 * Reusable Horizontal Filter Panel Component
 * @param {Array} options List of items { label, value } or strings
 * @param {String} activeValue Selected option value
 * @param {Function} onChange Callback triggered when option clicked
 */
function FilterPanel({ options, activeValue, onChange }) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "10px 0 15px 0" }}>
      {options.map((opt, idx) => {
        const value = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? opt.label : opt;
        const isSelected = activeValue === value;

        return (
          <Button
            key={idx}
            onClick={() => onChange(value)}
            type={isSelected ? "primary" : "ghost"}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: isSelected ? "var(--primary)" : "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              color: isSelected ? "black" : "#cbd5e1"
            }}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

export default React.memo(FilterPanel);
