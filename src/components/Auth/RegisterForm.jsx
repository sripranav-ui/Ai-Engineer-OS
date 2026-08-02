import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Input from "../Common/Input";
import Button from "../Common/Button";

// =======================================================
// RegisterForm.jsx
// Form controller for registration flow
// =======================================================

function RegisterForm() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Compute password strength indicators
  const passwordStrength = useMemo(() => {
    if (!password) return { text: "", level: "" };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { text: "Weak", level: "weak" };
    if (score <= 4) return { text: "Medium", level: "medium" };
    return { text: "Strong", level: "strong" };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      navigate("/"); // Redirect to dashboard on success
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error-box">{error}</div>}

      <Input
        label="Display Name"
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
          Password
        </label>
        <input
          type="password"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          disabled={loading}
          required
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "var(--text-primary)",
            fontSize: "14px"
          }}
        />
        {/* Password Strength UI Indicator */}
        {password && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              <span>Strength:</span>
              <span style={{
                fontWeight: "700",
                color: passwordStrength.level === "strong" ? "#10b981" : passwordStrength.level === "medium" ? "#f59e0b" : "#ef4444"
              }}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="pwd-strength-container">
              <div className={`pwd-strength-bar ${passwordStrength.level ? passwordStrength.level : ""}`} />
              <div className={`pwd-strength-bar ${passwordStrength.level === "medium" || passwordStrength.level === "strong" ? passwordStrength.level : ""}`} />
              <div className={`pwd-strength-bar ${passwordStrength.level === "strong" ? passwordStrength.level : ""}`} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-input"
          disabled={loading}
          required
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "var(--text-primary)",
            fontSize: "14px"
          }}
        />
      </div>

      <Button type="primary" fullWidth disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}

export default React.memo(RegisterForm);
