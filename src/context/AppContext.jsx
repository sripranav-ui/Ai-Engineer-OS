// =======================================================
// AppContext.jsx
// Global State Management for AI Engineer OS
// High-Resilience LocalStorage Guarding
// =======================================================

import { createContext, useState, useEffect, useMemo, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import storageService from "../services/storageService";
import roadmapData from "../data/roadmap";
import projectsData from "../data/projects";

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useContext(AuthContext) || {};
  const userId = user?.id || "guest";

  const hydratedUserIdRef = useRef(userId);
  const isHydratedRef = useRef(true);

  const ENRICH_PROJECTS = (list) => {
    const safeList = Array.isArray(list) && list.length > 0 ? list : (projectsData || []);
    return safeList.map((p) => {
      if (!p) return null;
      const title = p.title || "Untitled Project";
      const skills = Array.isArray(p.skills) ? p.skills : ["Python", "AI"];

      const tasks = Array.isArray(p.tasks) ? p.tasks : [
        { id: 1, text: `Initialize ${title} Repository`, status: "Completed" },
        { id: 2, text: `Configure environmental tools`, status: "In Progress" },
      ];

      const files = Array.isArray(p.files) ? p.files : [
        {
          id: 1,
          name: "main.py",
          language: "python",
          content: `def main():\n    print("Welcome to ${title} Workspace!")\n\nif __name__ == '__main__':\n    main()`,
        },
      ];

      const comments = Array.isArray(p.comments) ? p.comments : [];
      const resources = Array.isArray(p.resources) ? p.resources : [];
      const milestones = Array.isArray(p.milestones) ? p.milestones : [];
      const notes = p.notes || `## Developer Notes - ${title}`;
      const progressPercent = p.progressPercent !== undefined ? p.progressPercent : (p.completed ? 100 : 35);
      const kanbanStatus = p.kanbanStatus || (p.completed ? "Completed" : "In Progress");

      return {
        ...p,
        title,
        skills,
        status: "Unlocked",
        tasks,
        files,
        comments,
        resources,
        milestones,
        notes,
        progressPercent,
        kanbanStatus,
      };
    }).filter(Boolean);
  };

  // State Container with explicit owner userId stamp
  const [appState, setAppState] = useState(() => {
    const rawRoadmap = storageService.getInitialScopedData("roadmap", userId, roadmapData || []);
    const rawProjects = storageService.getInitialScopedData("projects", userId, projectsData);
    return {
      userId,
      profileName: storageService.getInitialScopedData("profileName", userId, user?.name || "Pranav"),
      profileBio: storageService.getInitialScopedData("profileBio", userId, user?.bio || "AI Engineering student"),
      xp: Number(storageService.getInitialScopedData("xp", userId, 120)) || 120,
      studyTimeToday: Number(storageService.getInitialScopedData("studyTimeToday", userId, 35)) || 35,
      streak: Number(storageService.getInitialScopedData("streak", userId, 3)) || 3,
      currentDay: Number(storageService.getInitialScopedData("currentDay", userId, 1)) || 1,
      roadmap: (Array.isArray(rawRoadmap) && rawRoadmap.length > 0 ? rawRoadmap : roadmapData).map((item) => ({ ...item, unlocked: true })),
      projects: ENRICH_PROJECTS(rawProjects),
      certificates: Number(storageService.getInitialScopedData("certificates", userId, 0)) || 0,
    };
  });

  // Re-hydrate when active user identity changes
  useEffect(() => {
    const rawRoadmap = storageService.getInitialScopedData("roadmap", userId, roadmapData || []);
    const rawProjects = storageService.getInitialScopedData("projects", userId, projectsData);
    setAppState({
      userId,
      profileName: storageService.getInitialScopedData("profileName", userId, user?.name || "Pranav"),
      profileBio: storageService.getInitialScopedData("profileBio", userId, user?.bio || "AI Engineering student"),
      xp: Number(storageService.getInitialScopedData("xp", userId, 120)) || 120,
      studyTimeToday: Number(storageService.getInitialScopedData("studyTimeToday", userId, 35)) || 35,
      streak: Number(storageService.getInitialScopedData("streak", userId, 3)) || 3,
      currentDay: Number(storageService.getInitialScopedData("currentDay", userId, 1)) || 1,
      roadmap: (Array.isArray(rawRoadmap) && rawRoadmap.length > 0 ? rawRoadmap : roadmapData).map((item) => ({ ...item, unlocked: true })),
      projects: ENRICH_PROJECTS(rawProjects),
      certificates: Number(storageService.getInitialScopedData("certificates", userId, 0)) || 0,
    });
  }, [userId, user?.name, user?.bio]);

  // Persist user-scoped state updates ONLY when in-memory state matches active userId
  useEffect(() => {
    if (appState.userId !== userId) return;
    storageService.set(storageService.getUserKey("profileName", userId), appState.profileName);
    storageService.set(storageService.getUserKey("profileBio", userId), appState.profileBio);
    storageService.set(storageService.getUserKey("xp", userId), appState.xp);
    storageService.set(storageService.getUserKey("studyTimeToday", userId), appState.studyTimeToday);
    storageService.set(storageService.getUserKey("streak", userId), appState.streak);
    storageService.set(storageService.getUserKey("currentDay", userId), appState.currentDay);
    if (Array.isArray(appState.roadmap)) {
      storageService.set(storageService.getUserKey("roadmap", userId), JSON.stringify(appState.roadmap));
    }
    if (Array.isArray(appState.projects)) {
      storageService.set(storageService.getUserKey("projects", userId), JSON.stringify(appState.projects));
    }
    storageService.set(storageService.getUserKey("certificates", userId), appState.certificates);
  }, [appState, userId]);

  const isOwner = appState.userId === userId;
  const profileName = isOwner ? appState.profileName : (user?.name || "Pranav");
  const profileBio = isOwner ? appState.profileBio : (user?.bio || "AI Engineering student");
  const xp = isOwner ? appState.xp : 120;
  const studyTimeToday = isOwner ? appState.studyTimeToday : 35;
  const streak = isOwner ? appState.streak : 3;
  const currentDay = isOwner ? appState.currentDay : 1;
  const roadmap = isOwner ? appState.roadmap : roadmapData;
  const projects = isOwner ? appState.projects : [];
  const certificates = isOwner ? appState.certificates : 0;

  const level = Math.floor(xp / 500) + 1;
  const xpInCurrentLevel = xp % 500;
  const nextLevelXp = 500;
  const totalDays = 365;

  const setProfileName = (val) => setAppState((prev) => ({ ...prev, userId, profileName: typeof val === "function" ? val(prev.profileName) : val }));
  const setProfileBio = (val) => setAppState((prev) => ({ ...prev, userId, profileBio: typeof val === "function" ? val(prev.profileBio) : val }));
  const setStudyTimeToday = (val) => setAppState((prev) => ({ ...prev, userId, studyTimeToday: typeof val === "function" ? val(prev.studyTimeToday) : val }));
  const setStreak = (val) => setAppState((prev) => ({ ...prev, userId, streak: typeof val === "function" ? val(prev.streak) : val }));
  const setCurrentDay = (val) => setAppState((prev) => ({ ...prev, userId, currentDay: typeof val === "function" ? val(prev.currentDay) : val }));
  const setRoadmap = (val) => setAppState((prev) => ({ ...prev, userId, roadmap: typeof val === "function" ? val(prev.roadmap) : val }));
  const setProjects = (val) => setAppState((prev) => ({ ...prev, userId, projects: typeof val === "function" ? val(prev.projects) : val }));
  const setCertificates = (val) => setAppState((prev) => ({ ...prev, userId, certificates: typeof val === "function" ? val(prev.certificates) : val }));

  const awardXP = (amount) => {
    if (typeof amount === "number" && amount > 0) {
      setAppState((prev) => ({ ...prev, userId, xp: prev.xp + amount }));
    }
  };

  const toggleDayCompletion = (dayId) => {
    setAppState((prev) => {
      const list = Array.isArray(prev.roadmap) ? prev.roadmap : [];
      let awarded = false;
      const updated = list.map((item) => {
        if (item.id === dayId) {
          const nextCompletedState = !item.completed;
          if (nextCompletedState) awarded = true;
          return { ...item, completed: nextCompletedState };
        }
        return item;
      });
      return {
        ...prev,
        userId,
        xp: awarded ? prev.xp + 50 : prev.xp,
        roadmap: updated,
      };
    });
  };

  const toggleProjectCompletion = (projectId) => {
    setAppState((prev) => {
      const list = Array.isArray(prev.projects) ? prev.projects : [];
      let awarded = false;
      const updated = list.map((project) => {
        if (project.id === projectId) {
          const nextCompleted = !project.completed;
          if (nextCompleted) awarded = true;
          return {
            ...project,
            completed: nextCompleted,
            progressPercent: nextCompleted ? 100 : 35,
            kanbanStatus: nextCompleted ? "Completed" : "In Progress",
          };
        }
        return project;
      });
      return {
        ...prev,
        userId,
        xp: awarded ? prev.xp + 150 : prev.xp,
        projects: updated,
      };
    });
  };

  const safeRoadmap = useMemo(() => (Array.isArray(roadmap) ? roadmap : []), [roadmap]);
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);

  return (
    <AppContext.Provider
      value={{
        profileName,
        setProfileName,
        profileBio,
        setProfileBio,
        xp,
        level,
        xpInCurrentLevel,
        nextLevelXp,
        awardXP,
        studyTimeToday,
        setStudyTimeToday,
        streak,
        setStreak,
        currentDay,
        setCurrentDay,
        roadmap: safeRoadmap,
        setRoadmap,
        projects: safeProjects,
        setProjects,
        certificates,
        setCertificates,
        totalDays,
        toggleDayCompletion,
        toggleProjectCompletion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;