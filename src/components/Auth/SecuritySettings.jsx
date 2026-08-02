import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Button from "../Common/Button";

// =======================================================
// SecuritySettings.jsx
// Form controller for password change triggers
// =======================================================

function SecuritySettings() {
  const { updatePassword } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Validation checks
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password cannot be the same as current password.");
      return;
    }

    try {
      setLoading(true);
      await updatePassword(currentPassword, newPassword);
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {success && <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#34d399", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: "600" }}>{success}</div>}
      {error && <div className="auth-error-box">{error}</div>}

      {/* Current Password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Current Password</label>
        <input
          type="password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
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

      {/* New Password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>New Password</label>
        <input
          type="password"
          placeholder="Enter new password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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

      {/* Confirm Password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
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

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
        <Button type="primary" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}

export default React.memo(SecuritySettings);
