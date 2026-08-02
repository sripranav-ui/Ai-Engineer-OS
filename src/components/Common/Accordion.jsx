import React, { useState } from "react";

/**
 * Reusable Accordion Component
 * @param {Array} items List of { header, content }
 * @param {Boolean} allowMultiple Allow multiple expanded items (default: false)
 */
function Accordion({ items = [], allowMultiple = false }) {
  const [expandedIndices, setExpandedIndices] = useState([]);

  const safeExpanded = Array.isArray(expandedIndices) ? expandedIndices : [];
  const safeItems = Array.isArray(items) ? items : [];

  const handleToggle = (index) => {
    if (allowMultiple) {
      if (safeExpanded.includes(index)) {
        setExpandedIndices(safeExpanded.filter((i) => i !== index));
      } else {
        setExpandedIndices([...safeExpanded, index]);
      }
    } else {
      if (safeExpanded.includes(index)) {
        setExpandedIndices([]);
      } else {
        setExpandedIndices([index]);
      }
    }
  };

  return (
    <div className="accordion-wrapper">
      {safeItems.map((item, index) => {
        const isExpanded = safeExpanded.includes(index);
        return (
          <div key={index} className="accordion-item">
            <button
              onClick={() => handleToggle(index)}
              className="accordion-trigger"
              type="button"
            >
              <span>{item?.header || "Section"}</span>
              <span>{isExpanded ? "▲" : "▼"}</span>
            </button>
            {isExpanded && (
              <div className="accordion-content fade-in">
                {item?.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(Accordion);
