import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ProfileCard from "../components/Auth/ProfileCard";
import AccountSettings from "../components/Auth/AccountSettings";
import SecuritySettings from "../components/Auth/SecuritySettings";
import Card from "../components/Common/Card";
import useDocumentMetadata from "../hooks/useDocumentMetadata";

// =======================================================
// ProfilePage.jsx — Identity Settings
// Split layout: profile card + tabbed settings.
// =======================================================

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("account");
  useDocumentMetadata("Profile", "Customize your identity and security settings.");

  return (
    <div className="page-shell fade-in">
      {/* Header */}
      <div className="page-title-block">
        <h1>Identity</h1>
        <p>Customize your profile, accent colors, or update security credentials.</p>
      </div>

      {/* Split Layout */}
      <div className="split-layout">
        {/* Left: Profile Card */}
        <ProfileCard user={user} />

        {/* Right: Settings */}
        <div>
          <div className="profile-tabs spacer-sm">
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              Account
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              Security
            </button>
          </div>

          <Card>
            {activeTab === "account" ? <AccountSettings /> : <SecuritySettings />}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProfilePage);
