import React from "react";

// =======================================================
// Avatar.jsx
// Reusable Avatar Component
// =======================================================

function Avatar({ src, alt, size = "md" }) {
  return (
    <div className={`avatar avatar-${size}`}>
      {src ? (
        <img src={src} alt={alt || "Avatar"} />
      ) : (
        <div className="avatar-placeholder">
          {(alt || "?")[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default React.memo(Avatar);
