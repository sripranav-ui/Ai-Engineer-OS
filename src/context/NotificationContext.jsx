import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { WorkspaceManagerContext } from "./WorkspaceManagerContext";
import { NotificationRepository } from "../repositories/NotificationRepository";
import logger from "../utils/logger";

export const NotificationContext = createContext();

const SEED_NOTIFICATIONS = [
  {
    id: "notice_1",
    title: "🏆 Level 2 Milestone Achieved!",
    message: "Congratulations! You completed the Day 7 prerequisites validation and earned 500 XP.",
    priority: "success",
    type: "achievement",
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: "notice_2",
    title: "📅 Quiz Day 8 Reminder",
    message: "Prerequisite study blocks tasks and flashcard runs are due today at midnight.",
    priority: "warning",
    type: "planner",
    read: false,
    timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  },
  {
    id: "notice_3",
    title: "💻 Sprint Project Overdue",
    message: "Task 'Build login API client' in Project Dashboard has crossed the milestone target date.",
    priority: "error",
    type: "project",
    read: false,
    timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: "notice_4",
    title: "💼 STAR Responses Reviewed",
    message: "AI Career Coach has completed evaluation of your STAR behavioral prompts answers.",
    priority: "info",
    type: "career",
    read: true,
    timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

export function NotificationProvider({ children }) {
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Load notifications from repository on mount or active workspace id changes
  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await NotificationRepository.getNotificationsList(activeWorkspaceId);
        if (data && data.length > 0) {
          setNotifications(data);
        } else {
          // Initialize seed default notices
          setNotifications(SEED_NOTIFICATIONS);
          await NotificationRepository.saveNotificationsList(SEED_NOTIFICATIONS, activeWorkspaceId);
        }
      } catch (err) {
        logger.error("[NotificationContext] Error loading notifications list:", err);
      }
    };
    loadNotices();
  }, [activeWorkspaceId]);

  // Sync to repository helper
  const syncNotices = async (updatedList) => {
    setNotifications(updatedList);
    try {
      await NotificationRepository.saveNotificationsList(updatedList, activeWorkspaceId);
    } catch (err) {
      logger.error("[NotificationContext] Error syncing notifications list:", err);
    }
  };

  const value = useMemo(() => {
    const unreadCount = notifications.filter(n => !n.read).length;

    return {
      notifications,
      unreadCount,
      toasts,

      addNotification: (title, message, priority = "info", type = "reminder") => {
        const id = "notice_" + Date.now();
        const newNotice = {
          id,
          title,
          message,
          priority,
          type,
          read: false,
          timestamp: new Date().toISOString()
        };
        const updated = [newNotice, ...notifications];
        syncNotices(updated);

        // Add toast alert simultaneously
        setToasts(prev => [...prev, { id, title, message, priority }]);
      },

      markAsRead: (id) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        syncNotices(updated);
      },

      markAllRead: () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        syncNotices(updated);
      },

      deleteNotification: (id) => {
        const updated = notifications.filter(n => n.id !== id);
        syncNotices(updated);
      },

      clearAll: () => {
        syncNotices([]);
      },

      removeToast: (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }
    };
  }, [notifications, toasts, activeWorkspaceId]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
