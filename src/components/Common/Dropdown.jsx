import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";

/**
 * Reusable Dropdown Component
 */
function Dropdown({ triggerLabel, options = [], onSelect, type = "outline" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemSelect = (opt) => {
    setIsOpen(false);
    if (onSelect) onSelect(opt);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <Button onClick={() => setIsOpen((prev) => !prev)} type={type}>
        {triggerLabel} <span style={{ fontSize: "10px", marginLeft: "4px" }}>▼</span>
      </Button>

      {isOpen && (
        <div
          className="modal-scale-enter"
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: "var(--surface-1)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            boxShadow: "var(--shadow-lg)",
            zIndex: "var(--z-popover)",
            minWidth: "160px",
            padding: "5px 0",
            overflow: "hidden"
          }}
        >
          {options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => handleItemSelect(opt)}
              style={{
                padding: "10px 14px",
                color: "var(--text-primary)",
                fontSize: "13px",
                cursor: "pointer",
                transition: "background var(--duration-fast) var(--ease-smooth)"
              }}
              onMouseEnter={(e) => (e.target.style.background = "var(--surface-3)")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              {opt.label || opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(Dropdown);
