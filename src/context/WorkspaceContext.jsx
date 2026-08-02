import React, { createContext, useState, useEffect, useMemo } from "react";
import storageService from "../services/storageService";

export const WorkspaceContext = createContext();

/**
 * Isolated Coding Workspace Context Provider
 */
export function WorkspaceProvider({ children }) {
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    return storageService.get("active_workspace", "python-cli");
  });
  
  const [isSplit, setIsSplit] = useState(false);

  useEffect(() => {
    storageService.set("active_workspace", activeWorkspace);
  }, [activeWorkspace]);

  const value = useMemo(() => ({
    activeWorkspace,
    setActiveWorkspace,
    isSplit,
    setIsSplit,
  }), [activeWorkspace, isSplit]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export default WorkspaceContext;
