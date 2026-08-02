import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { WorkspaceManagerContext } from "./WorkspaceManagerContext";
import repositories from "../repositories";

export const PlannerContext = createContext();

/**
 * Isolated Planner Schedules Context Provider (Namespaced)
 */
export function PlannerProvider({ children }) {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const [plannerSchedules, setPlannerSchedules] = useState([]);

  // Load scheduler list when active workspace changes
  useEffect(() => {
    repositories.planner().getScheduleList(activeWorkspaceId).then((data) => {
      setPlannerSchedules(data);
    });
  }, [activeWorkspaceId]);

  const updateSchedules = (nextList) => {
    setPlannerSchedules(nextList);
    repositories.planner().saveScheduleList(nextList, activeWorkspaceId);
  };

  const value = useMemo(() => ({
    plannerSchedules,
    setPlannerSchedules: updateSchedules,
  }), [plannerSchedules, activeWorkspaceId]);

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}

export default PlannerContext;
