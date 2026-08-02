import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import AppContext from "./AppContext";

// =======================================================
// GamificationContext.jsx
// Core Gamification Engine context provider
// =======================================================

export const GamificationContext = createContext();

const INITIAL_ACHIEVEMENTS = [
  { id: "first_lesson", title: "First Step", desc: "Complete your first learning milestone", xpReward: 100, icon: "📖", unlocked: false },
  { id: "streak_5", title: "Unstoppable Focus", desc: "Unlock a 5-day study streak", xpReward: 200, icon: "🔥", unlocked: false },
  { id: "builder", title: "Hands-on Engineer", desc: "Complete 1 learning portfolio project", xpReward: 250, icon: "💻", unlocked: false },
  { id: "cert_holder", title: "Certified Specialist", desc: "Unlock your first milestone credential", xpReward: 400, icon: "🏆", unlocked: false },
  { id: "halfway_there", title: "Halfway Hero", desc: "Complete 50% of the active curriculum", xpReward: 300, icon: "⚡", unlocked: false },
  { id: "ai_expert", title: "Core AI Guru", desc: "Complete all curriculum milestones", xpReward: 600, icon: "🧠", unlocked: false },
];

const DAILY_REWARDS_CONFIG = [
  { day: 1, xp: 50 },
  { day: 2, xp: 100 },
  { day: 3, xp: 150 },
  { day: 4, xp: 200 },
  { day: 5, xp: 250 },
  { day: 6, xp: 300 },
  { day: 7, xp: 500 },
];

export function GamificationProvider({ children }) {
  const {
    xp,
    awardXP,
    roadmap,
    projects,
    certificates,
    streak,
    profileName,
  } = useContext(AppContext);

  // --- 1. Achievements State ---
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem("gamify_achievements");
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  useEffect(() => {
    localStorage.setItem("gamify_achievements", JSON.stringify(achievements));
  }, [achievements]);

  // --- 2. Daily Rewards State ---
  const [dailyRewardStreak, setDailyRewardStreak] = useState(() => {
    const saved = localStorage.getItem("daily_reward_streak");
    return saved ? Number(saved) : 1;
  });

  const [lastClaimDate, setLastClaimDate] = useState(() => {
    return localStorage.getItem("last_claim_date") || "";
  });

  useEffect(() => {
    localStorage.setItem("daily_reward_streak", dailyRewardStreak);
  }, [dailyRewardStreak]);

  useEffect(() => {
    localStorage.setItem("last_claim_date", lastClaimDate);
  }, [lastClaimDate]);

  // Determine if claimed today
  const dailyRewardClaimed = useMemo(() => {
    const today = new Date().toDateString();
    return lastClaimDate === today;
  }, [lastClaimDate]);

  // --- 3. Achievement Popups Alerts ---
  const [activePopup, setActivePopup] = useState(null);

  // Trigger popup auto-close timer
  useEffect(() => {
    if (activePopup) {
      const timer = setTimeout(() => {
        setActivePopup(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activePopup]);

  // --- 4. Challenge Progress ---
  const completedLessonsCount = useMemo(() => {
    return roadmap.filter((day) => day.completed).length;
  }, [roadmap]);

  const completedProjectsCount = useMemo(() => {
    return projects.filter((p) => p.completed).length;
  }, [projects]);

  const weeklyChallenge = useMemo(() => {
    const target = 3;
    const current = Math.min(completedLessonsCount, target);
    return {
      text: `Complete ${target} Roadmap Lessons`,
      current,
      target,
      xpReward: 300,
      completed: current >= target,
    };
  }, [completedLessonsCount]);

  const monthlyChallenge = useMemo(() => {
    const target = 1;
    const current = Math.min(completedProjectsCount, target);
    return {
      text: `Complete ${target} Portfolio Project`,
      current,
      target,
      xpReward: 600,
      completed: current >= target,
    };
  }, [completedProjectsCount]);

  // Unlock achievement helper
  const unlockAchievement = useCallback((id) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          awardXP(ach.xpReward);
          setActivePopup(ach); // Trigger popup
          return { ...ach, unlocked: true };
        }
        return ach;
      })
    );
  }, [awardXP]);

  // --- 5. Dynamic Achievement Checklist Checks ---
  useEffect(() => {
    // Check "First Step"
    if (completedLessonsCount >= 1) {
      unlockAchievement("first_lesson");
    }
    // Check "Halfway Hero"
    if (roadmap.length > 0 && completedLessonsCount >= roadmap.length / 2) {
      unlockAchievement("halfway_there");
    }
    // Check "Core AI Guru"
    if (roadmap.length > 0 && completedLessonsCount === roadmap.length) {
      unlockAchievement("ai_expert");
    }
    // Check "Hands-on Engineer"
    if (completedProjectsCount >= 1) {
      unlockAchievement("builder");
    }
    // Check "Unstoppable Focus"
    if (streak >= 5) {
      unlockAchievement("streak_5");
    }
    // Check "Certified Specialist"
    if (certificates > 0) {
      unlockAchievement("cert_holder");
    }
  }, [completedLessonsCount, completedProjectsCount, streak, certificates, roadmap.length, unlockAchievement]);

  // Claim Daily Rewards trigger
  const claimDailyReward = () => {
    if (dailyRewardClaimed) return;

    const today = new Date().toDateString();
    const currentDayReward = DAILY_REWARDS_CONFIG.find((r) => r.day === dailyRewardStreak) || DAILY_REWARDS_CONFIG[0];
    
    // Award XP
    awardXP(currentDayReward.xp);

    // Save date
    setLastClaimDate(today);

    // Increment streak up to 7
    setDailyRewardStreak((prev) => (prev >= 7 ? 1 : prev + 1));
  };

  // Reset claim streak if user skipped a day (Simulated helper checks on page mount)
  useEffect(() => {
    if (lastClaimDate) {
      const today = new Date();
      const lastClaim = new Date(lastClaimDate);
      const diffTime = Math.abs(today - lastClaim);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If skipped more than 1 day, reset claim streak
      if (diffDays > 1) {
        setDailyRewardStreak(1);
      }
    }
  }, [lastClaimDate]);

  // --- 6. Mock Leaderboard with Dynamic User XP ---
  const leaderboard = useMemo(() => {
    const baseCompetitors = [
      { name: "Sophia Miller", xp: 1850, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia", isUser: false },
      { name: "Ethan Hunt", xp: 1400, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan", isUser: false },
      { name: "Liam Vance", xp: 950, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam", isUser: false },
      { name: "Mia Chen", xp: 620, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia", isUser: false },
      { name: "Noah Carter", xp: 340, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah", isUser: false },
    ];

    // Append dynamic active user row
    const userRow = {
      name: profileName || "Pranav",
      xp,
      avatarUrl: "", // Uses custom avatar UI component logic
      isUser: true,
    };

    // Merge and sort descend
    return [...baseCompetitors, userRow].sort((a, b) => b.xp - a.xp);
  }, [xp, profileName]);

  const value = {
    achievements,
    dailyRewardStreak,
    dailyRewardClaimed,
    DAILY_REWARDS_CONFIG,
    activePopup,
    setActivePopup,
    weeklyChallenge,
    monthlyChallenge,
    claimDailyReward,
    leaderboard,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}
