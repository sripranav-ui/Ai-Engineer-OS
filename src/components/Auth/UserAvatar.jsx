import React from "react";

// =======================================================
// UserAvatar.jsx
// Selectable grid of vector SVGs generated via Dicebear API
// =======================================================

const AVATAR_OPTIONS = [
  { id: "bot1", label: "AI Robot v1", url: "https://api.dicebear.com/7.x/bottts/svg?seed=ai-bot" },
  { id: "bot2", label: "AI Robot v2", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Hacker" },
  { id: "dev1", label: "Developer Jack", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack" },
  { id: "dev2", label: "Developer Sara", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" },
  { id: "dev3", label: "Developer Alex", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
  { id: "dev4", label: "Developer Emma", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
  { id: "node1", label: "Neural Node", url: "https://api.dicebear.com/7.x/identicon/svg?seed=Cyber" },
  { id: "node2", label: "Quantum Core", url: "https://api.dicebear.com/7.x/identicon/svg?seed=Quantum" },
  { id: "expert1", label: "AI Specialist", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Expert" },
  { id: "geek1", label: "Pixel Wizard", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wizard" },
];

function UserAvatar({ selectedAvatar, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span className="avatar-selector-label">Choose Profile Avatar</span>
      
      <div className="avatar-grid">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selectedAvatar === avatar.url;
          return (
            <button
              key={avatar.id}
              type="button"
              className={`avatar-option-btn ${isSelected ? "selected" : ""}`}
              onClick={() => onSelect(avatar.url)}
              title={avatar.label}
              aria-label={`Select avatar: ${avatar.label}`}
            >
              <img src={avatar.url} alt={avatar.label} loading="lazy" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(UserAvatar);
