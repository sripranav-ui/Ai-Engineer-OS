import React from "react";

/**
 * Reusable Tooltip Component
 */
function Tooltip({ children, text, position = "top" }) {
  if (!text) return children;

  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip-bubble ${position}`}>
        {text}
      </div>
    </div>
  );
}

export default React.memo(Tooltip);
