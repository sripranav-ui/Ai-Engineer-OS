import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Input from "../Common/Input";
import Button from "../Common/Button";
import UserAvatar from "./UserAvatar";

// =======================================================
// AccountSettings.jsx
// Form controller for managing display profiles & themes
// =======================================================

const ACCENTS = [
  { name: "Blue", primary: "#2563eb", hover: "#1d4ed8" },
  { name: "Green", primary: "#10b981", hover: "#059669" },
  { name: "Purple", primary: "#8b5cf6", hover: "#7c3aed" },
  { name: "Orange", primary: "#f59e0b", hover: "#d97706" },
  { name: "Red", primary: "#ef4444", hover: "#dc2626" },
];

function AccountSettings() {
  const { user, updateProfile } = useContext(AuthContext);

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");

  // Preferences States
  const [theme, setTheme] = useState(user?.theme || "dark");
  const [accent, setAccent] = useState(user?.accentName || "Blue");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    const selectedAccent = ACCENTS.find((a) => a.name === accent) || ACCENTS[0];

    try {
      setLoading(true);
      await updateProfile({
        name,
        bio,
        avatarUrl,
        theme,
        accentName: accent,
        accentColor: selectedAccent.primary,
        accentColorHover: selectedAccent.hover,
      });
      setSuccess("Profile settings updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {success && <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#34d399", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", fontWeight: "600" }}>{success}</div>}
      {error && <div className="auth-error-box">{error}</div>}

      {/* Name Input */}
      <Input
        label="Display Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        required
      />

      {/* Headline Bio */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Headline Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="settings-textarea"
          disabled={loading}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "var(--text-primary)",
            fontSize: "14px",
            minHeight: "80px",
            resize: "vertical",
            fontFamily: "inherit"
          }}
        />
      </div>

      {/* Selectable SVG Avatar Grid */}
      <UserAvatar selectedAvatar={avatarUrl} onSelect={setAvatarUrl} />

      {/* Theme Settings Override */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "20px" }}>
        <label style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Theme Preferences</label>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "5px" }}>
          {/* Mode selections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>System Mode</span>
            <div style={{ display: "flex", gap: "10px" }}>
              {["light", "dark"].map((mode) => {
                const isActive = theme === mode;
                return (
                  <Button
                    key={mode}
                    type={isActive ? "primary" : "outline"}
                    onClick={() => setTheme(mode)}
                    disabled={loading}
                    style={{ textTransform: "capitalize", padding: "10px 20px", fontSize: "14px" }}
                  >
                    {mode} Mode
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Accent Color selection circle selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Accent Color Colorway</span>
            <div style={{ display: "flex", gap: "12px" }}>
              {ACCENTS.map((accOption) => {
                const isSelected = accent === accOption.name;
                return (
                  <button
                    key={accOption.name}
                    type="button"
                    className={`accent-color-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => setAccent(accOption.name)}
                    style={{
                      background: accOption.primary,
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      border: isSelected ? "3px solid #ffffff" : "2px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      transform: isSelected ? "scale(1.1)" : "none"
                    }}
                    title={accOption.name}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
        <Button type="primary" disabled={loading}>
          {loading ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export default React.memo(AccountSettings);
