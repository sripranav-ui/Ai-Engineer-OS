import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { WorkspaceManagerContext } from "./WorkspaceManagerContext";
import repositories from "../repositories";

export const AnalyticsContext = createContext();

/**
 * Isolated User Study Time Analytics Context Provider (Namespaced)
 */
export function AnalyticsProvider({ children }) {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const [studyTimeToday, setStudyTimeToday] = useState(35);

  // Load telemetry metrics when active workspace changes
  useEffect(() => {
    repositories.analytics().getTelemetryMetrics(activeWorkspaceId).then((metrics) => {
      setStudyTimeToday(metrics.timeSpentToday);
    });
  }, [activeWorkspaceId]);

  const updateStudyTime = (val) => {
    setStudyTimeToday(val);
    repositories.analytics().saveTelemetryMetrics({ timeSpentToday: val }, activeWorkspaceId);
  };

  const value = useMemo(() => ({
    studyTimeToday,
    setStudyTimeToday: updateStudyTime,
  }), [studyTimeToday, activeWorkspaceId]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export default AnalyticsContext;
