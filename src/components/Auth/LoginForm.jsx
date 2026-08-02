import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Input from "../Common/Input";
import Button from "../Common/Button";

// =======================================================
// LoginForm.jsx
// Form controller for sign-in process
// =======================================================

function LoginForm() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/"); // Redirect to dashboard on success
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error-box">{error}</div>}

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
            Password
          </label>
          <Link
            to="/forgot-password"
            style={{ fontSize: "12px", color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}
          >
            Forgot Password?
          </Link>
        </div>
        <input
          type="password"
          placeholder="Enter your password"
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
      </div>

      <Button type="primary" fullWidth disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

export default React.memo(LoginForm);
