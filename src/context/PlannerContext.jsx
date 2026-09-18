import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { WorkspaceManagerContext } from "./WorkspaceManagerContext";
import { AuthContext } from "./AuthContext";
import authorization from "../services/auth/authorization.js";
import { PERMISSIONS } from "../services/auth/permissionDefinitions.js";
import repositories from "../repositories";

export const PlannerContext = createContext();

/**
 * Isolated Planner Schedules Context Provider (Namespaced)
 */
export function PlannerProvider({ children }) {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const { user } = useContext(AuthContext) || {};
  const [plannerSchedules, setPlannerSchedules] = useState([]);

  // Load scheduler list when active workspace changes
  useEffect(() => {
    repositories.planner().getScheduleList(activeWorkspaceId).then((data) => {
      setPlannerSchedules(data);
    });
  }, [activeWorkspaceId]);

  const updateSchedules = (nextList) => {
    if (!user || !authorization.hasPermission(user, PERMISSIONS.MANAGE_TASKS)) {
      return;
    }
    setPlannerSchedules(nextList);
    repositories.planner().saveScheduleList(nextList, activeWorkspaceId);
  };

  const value = useMemo(() => ({
    plannerSchedules,
    setPlannerSchedules: updateSchedules,
  }), [plannerSchedules, activeWorkspaceId, user]);

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}

export default PlannerContext;
