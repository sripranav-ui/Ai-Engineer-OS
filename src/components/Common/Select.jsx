import React from "react";
import { FormDropdown } from "./FormControls";

// =======================================================
// Select.jsx
// Reusable Select Dropdown Component
// Standard API wrapping FormDropdown
// =======================================================

function Select({ label, options = [], value, onChange, error, className = "", ...props }) {
  return (
    <FormDropdown
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      error={error}
      className={className}
      {...props}
    />
  );
}

export default React.memo(Select);
