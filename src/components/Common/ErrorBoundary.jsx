import React from "react";
import Card from "./Card";
import Button from "./Button";
import logger from "../../utils/logger";

// =======================================================
// ErrorBoundary.jsx
// React Class Error Boundary to catch render-time crashes
// =======================================================

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("ErrorBoundary intercepted render crash:", error, errorInfo);
  }

  handleReload = () => {
    // Reset state and reload the page
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "var(--background)",
            padding: "20px",
            color: "var(--text-primary)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <Card
            style={{
              maxWidth: "540px",
              width: "100%",
              padding: "40px 30px",
              textAlign: "center",
              background: "var(--surface-1)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-xl)",
              borderRadius: "16px",
            }}
          >
            <span
              style={{
                fontSize: "64px",
                display: "block",
                marginBottom: "20px",
              }}
            >
              ⚠️
            </span>
            <h2 style={{ fontSize: "22px", color: "var(--danger)", margin: "0 0 10px", fontWeight: "800" }}>
              Workspace Render Crash Intercepted
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 25px" }}>
              An unexpected render-time JavaScript error has crashed this workspace viewport. Click below to reload your developer session.
            </p>

            {this.state.error && (
              <pre
                style={{
                  textAlign: "left",
                  background: "var(--surface-3)",
                  padding: "15px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  overflowX: "auto",
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "monospace",
                  marginBottom: "25px",
                  maxHeight: "150px",
                }}
              >
                <code>{this.state.error.toString()}</code>
              </pre>
            )}

            <Button onClick={this.handleReload} type="primary" fullWidth style={{ padding: "12px", background: "#ef4444", borderColor: "#dc2626" }}>
              Reload Developer Workspace
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
