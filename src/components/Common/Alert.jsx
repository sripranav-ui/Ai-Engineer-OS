import React from "react";

/**
 * Reusable Callout Alert Component
 */
function Alert({ type = "primary", title, children, style = {} }) {
  const icon = type === "success" ? "✔" : type === "warning" ? "⚠" : type === "danger" ? "✖" : "ℹ";

  return (
    <div className={`alert-callout ${type}`} style={style}>
      <span className="alert-icon">{icon}</span>
      <div style={{ flex: 1 }}>
        {title && <strong className="alert-title">{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default React.memo(Alert);
