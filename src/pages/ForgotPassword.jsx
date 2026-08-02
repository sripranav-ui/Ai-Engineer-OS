import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Input from "../components/Common/Input";
import Button from "../components/Common/Button";

// =======================================================
// ForgotPassword.jsx — Password Recovery
// =======================================================

function ForgotPassword() {
  const { resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Reset Password</h1>
      <p>We'll email you instructions to reset your password</p>

      {success ? (
        <div className="stack-sm" style={{ textAlign: "center" }}>
          <div className="badge badge-success" style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", lineHeight: 1.6 }}>
            A password reset link has been sent to <strong>{email}</strong>. Check your inbox.
          </div>
          <Link to="/login" className="auth-link" style={{ display: "block" }}>
            ← Back to Sign In
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <Button type="primary" fullWidth disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="auth-link">
            Remembered your password? <Link to="/login">Sign In</Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default React.memo(ForgotPassword);
