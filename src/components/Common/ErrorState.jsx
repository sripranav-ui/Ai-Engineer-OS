import React, { useState } from "react";
import Button from "./Button";

// =======================================================
// ErrorState.jsx — Production Error Recovery Component
// =======================================================
// Renders user-friendly error views with actionable recovery
// options and optional technical details toggle.
// =======================================================

function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this section.",
  errorDetails,
  onRetry,
  actionLabel = "Try Again",
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`error-state-card ${className}`}
      style={{
        padding: "var(--space-8)",
        background: "var(--surface-1)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        textAlign: "center",
        margin: "var(--space-4) 0",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "var(--danger-muted)",
          border: "1px solid var(--border-danger)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          color: "var(--danger)",
          marginBottom: "var(--space-4)",
        }}
      >
        ⚠️
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-md)",
          fontWeight: "700",
          color: "var(--text-primary)",
          letterSpacing: "var(--tracking-tight)",
          margin: "0 0 var(--space-2) 0",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          maxWidth: "440px",
          margin: "0 auto var(--space-6) auto",
          lineHeight: "1.6",
        }}
      >
        {message}
      </p>

      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
        {onRetry && (
          <Button onClick={onRetry} type="primary">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} type="ghost">
            {secondaryActionLabel}
          </Button>
        )}
      </div>

      {errorDetails && (
        <div style={{ marginTop: "var(--space-6)", textAlign: "left" }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-2xs)",
              color: "var(--text-ghost)",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            {showDetails ? "Hide technical error log" : "Show technical error log"}
          </button>
          {showDetails && (
            <pre
              style={{
                marginTop: "var(--space-2)",
                padding: "var(--space-3)",
                background: "var(--surface-3)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xs)",
                color: "var(--danger)",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {typeof errorDetails === "object" ? JSON.stringify(errorDetails, null, 2) : String(errorDetails)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(ErrorState);
