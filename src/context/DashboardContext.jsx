import React, { createContext, useState, useEffect, useMemo, useContext } from "react";
import { WorkspaceManagerContext } from "./WorkspaceManagerContext";
import repositories from "../repositories";

export const DashboardContext = createContext();

/**
 * Isolated User Progression Dashboard Context Provider (Namespaced)
 */
export function DashboardProvider({ children }) {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(3);

  // Load metrics when active workspace changes
  useEffect(() => {
    repositories.user().getProfile(activeWorkspaceId).then((profile) => {
      setXp(profile.xp);
      setStreak(profile.streak);
    });
  }, [activeWorkspaceId]);

  // Sync updates to repositories
  const saveStats = (nextXp, nextStreak) => {
    repositories.user().saveProfile({ xp: nextXp, streak: nextStreak }, activeWorkspaceId);
  };

  const level = useMemo(() => Math.floor(xp / 500) + 1, [xp]);
  const xpInCurrentLevel = useMemo(() => xp % 500, [xp]);

  const awardXP = (points) => {
    setXp((prev) => {
      const next = prev + points;
      saveStats(next, streak);
      return next;
    });
  };

  const updateStreak = (val) => {
    setStreak(val);
    saveStats(xp, val);
  };

  const value = useMemo(() => ({
    xp,
    level,
    xpInCurrentLevel,
    streak,
    setStreak: updateStreak,
    awardXP
  }), [xp, level, xpInCurrentLevel, streak, activeWorkspaceId]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export default DashboardContext;
