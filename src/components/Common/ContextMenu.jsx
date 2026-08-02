import React, { useEffect, useRef } from "react";
import { useUI } from "../../context/UIContext";

// =======================================================
// ContextMenu.jsx — Global Right-Click Context Menu
// =======================================================
// Activated by UIContext.openContextMenu(event, items).
//
// Usage:
//   const { openContextMenu } = useUI();
//   <div onContextMenu={(e) => openContextMenu(e, [
//     { label: "Rename",  icon: "✎",  action: () => handleRename() },
//     { label: "Delete",  icon: "✕",  action: () => handleDelete(), divider: true },
//   ])}>
// =======================================================

function ContextMenu() {
  const { contextMenu, closeContextMenu } = useUI();
  const panelRef = useRef(null);

  // Close on click outside or Escape
  useEffect(() => {
    if (!contextMenu.open) return;
    const onKey   = (e) => { if (e.key === "Escape") closeContextMenu(); };
    const onClick = ()  => closeContextMenu();
    window.addEventListener("keydown",   onKey,   { once: true });
    window.addEventListener("mousedown", onClick, { once: true });
    return () => {
      window.removeEventListener("keydown",   onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [contextMenu.open, closeContextMenu]);

  if (!contextMenu.open) return null;

  return (
    <ul
      ref={panelRef}
      className="context-menu"
      role="menu"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {contextMenu.items.map((item, idx) => {
        if (item.divider) {
          return <li key={`divider-${idx}`} className="context-menu-divider" role="separator" />;
        }
        return (
          <li key={idx} role="none">
            <button
              className={`context-menu-item${item.disabled ? " context-menu-item--disabled" : ""}`}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  closeContextMenu();
                  item.action();
                }
              }}
            >
              {item.icon && (
                <span className="context-menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="context-menu-label">{item.label}</span>
              {item.shortcut && (
                <kbd className="context-menu-shortcut">{item.shortcut}</kbd>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default React.memo(ContextMenu);
