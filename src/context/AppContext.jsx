// =======================================================
// AppContext.jsx
// Global State Management for AI Engineer OS
// High-Resilience LocalStorage Guarding
// =======================================================

import { createContext, useState, useEffect, useMemo } from "react";
import roadmapData from "../data/roadmap";
import projectsData from "../data/projects";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Profile Name & Bio State
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("profileName") || "Pranav";
  });
  const [profileBio, setProfileBio] = useState(() => {
    return localStorage.getItem("profileBio") || "AI Engineering student";
  });

  useEffect(() => {
    localStorage.setItem("profileName", profileName || "Pranav");
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem("profileBio", profileBio || "AI Engineering student");
  }, [profileBio]);

  // Gamified User Progression (XP, Level, Study Stats)
  const [xp, setXp] = useState(() => {
    const savedXp = localStorage.getItem("xp");
    return savedXp ? Number(savedXp) || 120 : 120;
  });

  const [studyTimeToday, setStudyTimeToday] = useState(() => {
    const savedTime = localStorage.getItem("studyTimeToday");
    return savedTime ? Number(savedTime) || 35 : 35;
  });

  const [streak, setStreak] = useState(() => {
    const savedStreak = localStorage.getItem("streak");
    return savedStreak ? Number(savedStreak) || 3 : 3;
  });

  const level = Math.floor(xp / 500) + 1;
  const xpInCurrentLevel = xp % 500;
  const nextLevelXp = 500;

  useEffect(() => {
    localStorage.setItem("xp", xp);
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("studyTimeToday", studyTimeToday);
  }, [studyTimeToday]);

  useEffect(() => {
    localStorage.setItem("streak", streak);
  }, [streak]);

  const awardXP = (points) => {
    setXp((prevXp) => Math.max(0, prevXp + (Number(points) || 0)));
  };

  const [currentDay, setCurrentDay] = useState(() => {
    const savedDay = localStorage.getItem("currentDay");
    return savedDay ? Number(savedDay) || 1 : 1;
  });

  // Guarded Roadmap State
  const [roadmap, setRoadmap] = useState(() => {
    try {
      const savedRoadmap = localStorage.getItem("roadmap");
      const parsed = savedRoadmap ? JSON.parse(savedRoadmap) : null;
      const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : (roadmapData || []);
      return list.map((item) => ({ ...item, unlocked: true }));
    } catch {
      return (roadmapData || []).map((item) => ({ ...item, unlocked: true }));
    }
  });

  // Guarded Projects State
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

  const [projects, setProjects] = useState(() => {
    try {
      const savedProjects = localStorage.getItem("projects");
      const parsed = savedProjects ? JSON.parse(savedProjects) : null;
      const rawList = Array.isArray(parsed) && parsed.length > 0 ? parsed : projectsData;
      return ENRICH_PROJECTS(rawList);
    } catch {
      return ENRICH_PROJECTS(projectsData);
    }
  });

  const [certificates, setCertificates] = useState(() => {
    const savedCertificates = localStorage.getItem("certificates");
    return savedCertificates ? Number(savedCertificates) || 0 : 0;
  });

  const totalDays = 365;

  useEffect(() => {
    localStorage.setItem("currentDay", currentDay);
  }, [currentDay]);

  useEffect(() => {
    if (Array.isArray(roadmap)) {
      localStorage.setItem("roadmap", JSON.stringify(roadmap));
    }
  }, [roadmap]);

  useEffect(() => {
    if (Array.isArray(projects)) {
      localStorage.setItem("projects", JSON.stringify(projects));
    }
  }, [projects]);

  const toggleDayCompletion = (dayId) => {
    setRoadmap((prevRoadmap) => {
      const list = Array.isArray(prevRoadmap) ? prevRoadmap : [];
      return list.map((item) => {
        if (item.id === dayId) {
          const nextCompletedState = !item.completed;
          if (nextCompletedState) awardXP(50);
          return { ...item, completed: nextCompletedState };
        }
        return item;
      });
    });
  };

  const toggleProjectCompletion = (projectId) => {
    setProjects((prevProjects) => {
      const list = Array.isArray(prevProjects) ? prevProjects : [];
      return list.map((project) => {
        if (project.id === projectId) {
          const nextCompleted = !project.completed;
          if (nextCompleted) awardXP(150);
          return {
            ...project,
            completed: nextCompleted,
            progressPercent: nextCompleted ? 100 : 35,
            kanbanStatus: nextCompleted ? "Completed" : "In Progress",
          };
        }
        return project;
      });
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