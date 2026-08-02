import React, { createContext, useState, useEffect, useMemo } from "react";
import storageService from "../services/storageService";

export const WorkspaceManagerContext = createContext();

const INITIAL_WORKSPACES = [
  { id: "ai-engineering", name: "AI Engineering", icon: "🤖", color: "#3b82f6", description: "Core AI engineering research and workspace", archived: false },
  { id: "machine-learning", name: "Machine Learning", icon: "📊", color: "#10b981", description: "Regression models and telemetry setups", archived: false },
  { id: "deep-learning", name: "Deep Learning", icon: "🧠", color: "#8b5cf6", description: "Neural networks training checkpoints", archived: false },
  { id: "college", name: "College Curriculum", icon: "🎓", color: "#eab308", description: "University courses files and academic notes", archived: false },
  { id: "placement-prep", name: "Placement Preparation", icon: "💼", color: "#f97316", description: "Mock STAR interviews and coding challenges", archived: false },
  { id: "research", name: "Research & Development", icon: "🔬", color: "#ef4444", description: "Custom drafts notebooks and vector index ideas", archived: false },
  { id: "personal", name: "Personal Space", icon: "🏠", color: "#06b6d4", description: "Private schedules checklist tasks", archived: false }
];

/**
 * Enterprise Multi-Workspace Management Context Provider
 */
export function WorkspaceManagerProvider({ children }) {
  const [workspaces, setWorkspaces] = useState(() => {
    const raw = storageService.get("multi_workspaces");
    return raw ? JSON.parse(raw) : INITIAL_WORKSPACES;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return storageService.get("active_workspace_id", "ai-engineering");
  });

  useEffect(() => {
    storageService.set("multi_workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    storageService.set("active_workspace_id", activeWorkspaceId);
  }, [activeWorkspaceId]);

  const value = useMemo(() => {
    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

    return {
      workspaces,
      activeWorkspaceId,
      activeWorkspace,
      
      switchWorkspace: (id) => {
        setActiveWorkspaceId(id);
      },

      createWorkspace: (name, icon, color, description) => {
        const newWS = {
          id: `ws-${Date.now()}`,
          name,
          icon: icon || "📁",
          color: color || "#3b82f6",
          description: description || "",
          archived: false
        };
        setWorkspaces((prev) => [...prev, newWS]);
        setActiveWorkspaceId(newWS.id);
        return newWS;
      },

      renameWorkspace: (id, name) => {
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === id ? { ...w, name } : w))
        );
      },

      duplicateWorkspace: (id) => {
        const target = workspaces.find((w) => w.id === id);
        if (!target) return;
        const dup = {
          ...target,
          id: `ws-${Date.now()}`,
          name: `${target.name} (Copy)`
        };
        setWorkspaces((prev) => [...prev, dup]);
        setActiveWorkspaceId(dup.id);
      },

      archiveWorkspace: (id) => {
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === id ? { ...w, archived: true } : w))
        );
      },

      deleteWorkspace: (id) => {
        setWorkspaces((prev) => prev.filter((w) => w.id !== id));
        if (activeWorkspaceId === id) {
          const remaining = workspaces.filter((w) => w.id !== id);
          if (remaining.length > 0) {
            setActiveWorkspaceId(remaining[0].id);
          }
        }
      }
    };
  }, [workspaces, activeWorkspaceId]);

  return (
    <WorkspaceManagerContext.Provider value={value}>
      {children}
    </WorkspaceManagerContext.Provider>
  );
}

export default WorkspaceManagerContext;
