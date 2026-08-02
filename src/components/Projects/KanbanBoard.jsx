import React, { useState } from "react";
import Button from "../Common/Button";
import Badge from "../Common/Badge";
import Modal from "../Common/Modal";
import { KANBAN_COLUMNS } from "../../services/projects/taskEngine";

// =======================================================
// KanbanBoard.jsx — Production-Grade Kanban Component
// =======================================================
// Renders accessible multi-column Kanban board with task move
// controls, priority badges, subtask checklists, and task creation.
// =======================================================

function KanbanBoard({ tasks = [], onMoveTask, onAddTask, onToggleSubtask }) {
  const [collapsedCols, setCollapsedCols] = useState({});
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [newTitle, setNewTitle]           = useState("");
  const [newPriority, setNewPriority]     = useState("Medium");
  const [targetStatus, setTargetStatus]   = useState("todo");

  const toggleCol = (colId) => {
    setCollapsedCols((prev) => ({ ...prev, [colId]: !prev[colId] }));
  };

  const handleOpenAddModal = (colId) => {
    setTargetStatus(colId);
    setNewTitle("");
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    if (onAddTask) {
      onAddTask({ title: newTitle, priority: newPriority, status: targetStatus });
    }
    setIsModalOpen(false);
    setNewTitle("");
  };

  const priorityBadgeType = (p) => {
    switch (p) {
      case "Urgent": return "danger";
      case "High":   return "warning";
      case "Medium": return "primary";
      default:       return "secondary";
    }
  };

  return (
    <div className="kanban-board-container" style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, minmax(240px, 1fr))`, gap: "var(--space-4)", minWidth: "1200px" }}>
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isCollapsed = collapsedCols[col.id];

          return (
            <div
              key={col.id}
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3-5)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "750px",
              }}
            >
              {/* Column Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color }} />
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    {col.title}
                  </h4>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-ghost)", background: "var(--surface-3)", padding: "1px 6px", borderRadius: "10px" }}>
                    {colTasks.length}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => handleOpenAddModal(col.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: "14px" }}
                    title="Add task"
                  >
                    +
                  </button>
                  <button
                    onClick={() => toggleCol(col.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: "12px" }}
                    title={isCollapsed ? "Expand column" : "Collapse column"}
                  >
                    {isCollapsed ? "⇲" : "⇱"}
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              {!isCollapsed && (
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-3)",
                        boxShadow: "var(--shadow-xs)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2)" }}>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                          {task.title}
                        </span>
                        <Badge type={priorityBadgeType(task.priority)} style={{ fontSize: "10px" }}>
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "0 0 var(--space-2) 0", lineHeight: "1.4" }}>
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks summary */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div style={{ margin: "var(--space-2) 0", fontSize: "11px", color: "var(--text-ghost)" }}>
                          ✓ {task.subtasks.filter((st) => st.done).length} / {task.subtasks.length} subtasks
                        </div>
                      )}

                      {/* Move status buttons */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginTop: "var(--space-2)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--border-subtle)" }}>
                        {KANBAN_COLUMNS.filter((c) => c.id !== col.id).map((targetCol) => (
                          <button
                            key={targetCol.id}
                            onClick={() => onMoveTask && onMoveTask(task.id, targetCol.id)}
                            style={{
                              background: "var(--surface-3)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "4px",
                              fontSize: "10px",
                              color: "var(--text-tertiary)",
                              padding: "2px 6px",
                              cursor: "pointer",
                            }}
                            title={`Move to ${targetCol.title}`}
                          >
                            → {targetCol.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div style={{ textAlign: "center", padding: "var(--space-6) var(--space-2)", color: "var(--text-ghost)", fontSize: "12px", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                      No tasks in {col.title}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Task"
        actions={
          <>
            <Button onClick={() => setIsModalOpen(false)} type="ghost">Cancel</Button>
            <Button onClick={handleCreateTask} type="primary">Create Task</Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Task Title</label>
            <input
              type="text"
              placeholder="e.g. Implement Vector Similarity Search"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "6px", color: "var(--text-primary)", outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              style={{ width: "100%", padding: "10px", background: "var(--surface-1)", border: "1px solid var(--border-default)", borderRadius: "6px", color: "var(--text-primary)", outline: "none" }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default React.memo(KanbanBoard);
