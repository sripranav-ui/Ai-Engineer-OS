import React, { useState, useContext, useRef, useEffect } from "react";
import { WorkspaceManagerContext } from "../../context/WorkspaceManagerContext";
import Button from "./Button";
import Card from "./Card";

/**
 * Notion-Style Floating Workspace Switcher Component
 */
export function WorkspaceSwitcher() {
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace,
    renameWorkspace,
    duplicateWorkspace,
    archiveWorkspace,
    deleteWorkspace
  } = useContext(WorkspaceManagerContext);

  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [newIcon, setNewIcon] = useState("📁");
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const switcherRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createWorkspace(newName, newIcon, newColor, newDesc);
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
    setIsOpen(false);
  };

  const handleStartRename = (w, e) => {
    e.stopPropagation();
    setEditingId(w.id);
    setEditName(w.name);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (editName.trim()) {
      renameWorkspace(id, editName);
    }
    setEditingId(null);
  };

  return (
    <div ref={switcherRef} style={{ position: "relative", marginBottom: "15px" }}>
      {/* Active Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          background: "var(--surface-1)",
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-1)")}
      >
        <span
          style={{
            width: "28px",
            height: "28px",
            background: activeWorkspace.color,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px"
          }}
        >
          {activeWorkspace.icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ color: "var(--text-primary)", fontSize: "13.5px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeWorkspace.name}
          </strong>
          <span style={{ color: "var(--text-tertiary)", fontSize: "11px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeWorkspace.description || "Developer Workspace"}
          </span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>▼</span>
      </button>

      {/* Dropdown switch overlay options panel */}
      {isOpen && (
        <div
          className="modal-scale-enter"
          style={{
            position: "absolute",
            top: "105%",
            left: 0,
            right: 0,
            background: "var(--surface-1)",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 1100,
            maxHeight: "380px",
            overflowY: "auto",
            padding: "8px 0"
          }}
        >
          {/* Workspaces list */}
          <div style={{ padding: "0 8px 8px 8px", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: "700", textTransform: "uppercase", paddingLeft: "8px", display: "block", marginBottom: "4px" }}>
              Workspaces
            </span>

            {workspaces.filter(w => !w.archived).map((w) => {
              const isActive = w.id === activeWorkspace.id;
              const isEditing = w.id === editingId;

              return (
                <div
                  key={w.id}
                  onClick={() => !isEditing && switchWorkspace(w.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px",
                    borderRadius: "6px",
                    cursor: isEditing ? "default" : "pointer",
                    background: isActive ? "var(--surface-3)" : "transparent"
                  }}
                  onMouseEnter={(e) => { if (!isActive && !isEditing) e.currentTarget.style.background = "var(--surface-3)"; }}
                  onMouseLeave={(e) => { if (!isActive && !isEditing) e.currentTarget.style.background = "transparent"; }}
                >
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      background: w.color,
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px"
                    }}
                  >
                    {w.icon}
                  </span>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveRename(w.id, e)}
                        style={{
                          width: "100%",
                          background: "var(--surface-1)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          color: "var(--text-primary)",
                          fontSize: "12.5px"
                        }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "12.5px", fontWeight: isActive ? "700" : "500", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {w.name}
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: "flex", gap: "2px" }} onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <button onClick={(e) => handleSaveRename(w.id, e)} style={{ background: "none", border: "none", color: "var(--success)", cursor: "pointer", fontSize: "11px" }}>
                        ✔
                      </button>
                    ) : (
                      <>
                        <button onClick={(e) => handleStartRename(w, e)} title="Rename Workspace" style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "11px" }}>
                          ✏
                        </button>
                        <button onClick={() => duplicateWorkspace(w.id)} title="Duplicate Workspace" style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "11px" }}>
                          🗐
                        </button>
                        <button onClick={() => archiveWorkspace(w.id)} title="Archive Workspace" style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: "11px" }}>
                          📥
                        </button>
                        {workspaces.length > 1 && (
                          <button onClick={() => deleteWorkspace(w.id)} title="Delete Workspace" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "11px" }}>
                            🗑
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Creation segment */}
          <div style={{ padding: "8px 8px 0 8px" }}>
            {showCreate ? (
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <input
                  type="text"
                  placeholder="Workspace Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: "100%", background: "var(--surface-1)", border: "1px solid var(--border-strong)", borderRadius: "4px", padding: "4px 8px", color: "var(--text-primary)", fontSize: "12px" }}
                  required
                  autoFocus
                />
                
                <div style={{ display: "flex", gap: "4px" }}>
                  <input
                    type="text"
                    placeholder="Icon"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    style={{ width: "40px", background: "var(--surface-1)", border: "1px solid var(--border-strong)", borderRadius: "4px", padding: "4px 0", color: "var(--text-primary)", fontSize: "12px", textAlign: "center" }}
                  />
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    style={{ width: "100%", background: "none", border: "none", height: "26px", cursor: "pointer" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  <Button type="success" style={{ flex: 1, padding: "4px 0", fontSize: "11px" }}>
                    Create
                  </Button>
                  <Button type="ghost" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "4px 0", fontSize: "11px" }}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setShowCreate(true)} type="outline" fullWidth style={{ padding: "6px 0", fontSize: "12px" }}>
                ＋ Create Workspace
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceSwitcher;
