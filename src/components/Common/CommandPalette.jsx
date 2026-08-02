import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import { ThemeContext } from "../../context/ThemeContext";
import { NotesContext } from "../../context/NotesContext";
import { WorkspaceManagerContext } from "../../context/WorkspaceManagerContext";
import offlineSyncService from "../../services/offlineSyncService";
import logger from "../../utils/logger";
import { getSearchableRoutes } from "../../config/navigation";

// Derive pages list from single navigation registry (eliminates PAGES_LIST duplication)
const PAGES_LIST = getSearchableRoutes().map((r) => ({
  title: r.label,
  path:  r.path,
  type:  "Page",
}));

// Rich interactive commands list
const COMMANDS_LIST = [
  { title: "➕ Create New Project Workspace", action: "create_project", type: "Command" },
  { title: "➕ Create New Study Note", action: "create_note", type: "Command" },
  { title: "➕ Create New Planner Task", action: "create_task", type: "Command" },
  { title: "🔄 Toggle Global Theme (Cycle)", action: "toggle_theme", type: "Command" },
  { title: "⭐️ Toggle Favorite Active Status", action: "toggle_favorite", type: "Command" },
  { title: "🏁 Restart Onboarding Welcome Tour", action: "restart_onboarding", type: "Command" },
  { title: "💻 Toggle Telemetry Developer Console", action: "toggle_console", type: "Command" },
  { title: "🔌 Force Simulated Offline Disconnect", action: "offline_force", type: "Command" },
  { title: "🔌 Force Simulated Online Connect", action: "online_force", type: "Command" },
  { title: "🧹 Clear Local Sync Queue", action: "clear_sync_queue", type: "Command" }
];

import { NotificationContext } from "../../context/NotificationContext";

export function CommandPalette() {
  const navigate = useNavigate();
  const { roadmap, projects } = useContext(AppContext);
  const { notes } = useContext(NotesContext);
  const { activeWorkspaceId } = useContext(WorkspaceManagerContext);
  const { addNotification } = useContext(NotificationContext);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [recentPages, setRecentPages] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Load state profiles on open
  useEffect(() => {
    if (isOpen) {
      const recents = localStorage.getItem("sidebar_recent_pages");
      if (recents) setRecentPages(JSON.parse(recents));

      const favs = localStorage.getItem("palette_favorites");
      if (favs) setFavorites(JSON.parse(favs));
    }
  }, [isOpen]);

  // Listen to toggle keys Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearchQuery("");
        setSelectedCategory("All");
        setSelectedIndex(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Core Search Results Indexer
  const searchResults = useMemo(() => {
    let items = [];

    // 1. Pages
    items = items.concat(PAGES_LIST);

    // 2. Notes
    if (notes && notes.length > 0) {
      items = items.concat(notes.map(n => ({ title: `📓 Note: ${n.title}`, path: "/knowledge", type: "Note" })));
    }

    // 3. Lessons
    if (roadmap && roadmap.length > 0) {
      items = items.concat(roadmap.map(l => ({ title: `📖 Day ${l.id}: ${l.topic}`, path: "/learning", type: "Lesson" })));
    }

    // 4. Projects
    if (projects && projects.length > 0) {
      items = items.concat(projects.map(p => ({ title: `🚀 Project: ${p.title}`, path: "/projects", type: "Project" })));
    }

    // 5. Commands
    items = items.concat(COMMANDS_LIST);

    // Filter query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => item.title.toLowerCase().includes(q));
    }

    // Filter categories selector tab
    if (selectedCategory !== "All") {
      items = items.filter(item => item.type === selectedCategory);
    }

    return items.slice(0, 8); // Display top 8 matches
  }, [searchQuery, selectedCategory, notes, roadmap, projects]);

  const notify = (title, msg, priority = "info") => {
    if (addNotification) addNotification(title, msg, priority, "command");
  };

  const handleSelect = useCallback((item) => {
    if (!item) return;
    setIsOpen(false);

    if (item.type === "Command") {
      logger.info(`[Command Palette] Executing action command: ${item.action}`);
      
      switch (item.action) {
        case "create_project":
          notify("Opening Project Planner", "Redirecting to Projects workspace...", "info");
          navigate("/projects");
          break;
        case "create_note":
          notify("Opening Notes Creator", "Redirecting to Knowledge Hub...", "info");
          navigate("/knowledge");
          break;
        case "create_task":
          notify("Opening Task Planner", "Redirecting to Scheduler...", "info");
          navigate("/planner");
          break;
        case "toggle_theme":
          const nextTheme = theme === "dark" ? "light" : theme === "light" ? "dracula" : theme === "dracula" ? "cyberpunk" : "dark";
          setTheme(nextTheme);
          notify("Theme Switched", `Switched to ${nextTheme} theme`, "success");
          break;
        case "toggle_favorite":
          const activePath = window.location.pathname;
          let favList = [...favorites];
          if (favList.includes(activePath)) {
            favList = favList.filter(p => p !== activePath);
            notify("Favorite Removed", "Removed active page from palette favorites.", "info");
          } else {
            favList.push(activePath);
            notify("Favorite Saved", "Saved active page to palette favorites.", "success");
          }
          setFavorites(favList);
          localStorage.setItem("palette_favorites", JSON.stringify(favList));
          break;
        case "offline_force":
          offlineSyncService.setSimulatedOffline(true);
          notify("Offline Mode Active", "Simulated offline state enabled.", "warning");
          break;
        case "online_force":
          offlineSyncService.setSimulatedOffline(false);
          notify("Online Mode Active", "Simulated online connection restored.", "success");
          break;
        case "clear_sync_queue":
          offlineSyncService.clearQueue(activeWorkspaceId);
          notify("Sync Queue Cleared", "Offline sync queue has been reset.", "info");
          break;
        case "restart_onboarding":
          localStorage.removeItem("onboarding_tour_completed");
          notify("Tour Reset", "Refreshing workspace to start onboarding...", "info");
          setTimeout(() => window.location.reload(), 600);
          break;
        case "toggle_console":
          const kbdEvt = new KeyboardEvent("keydown", {
            key: "d",
            ctrlKey: true,
            altKey: true,
            bubbles: true
          });
          window.dispatchEvent(kbdEvt);
          break;
        default:
          break;
      }
    } else {
      navigate(item.path);
    }
  }, [navigate, favorites, activeWorkspaceId, addNotification]);

  // Arrow nav key listeners
  useEffect(() => {
    const handleKeyNav = (e) => {
      if (!isOpen || searchResults.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(searchResults[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [isOpen, searchResults, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--surface-overlay)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        zIndex: 9999
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "var(--surface-1)",
          border: "1px solid var(--border-default)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden"
        }}
        className="modal-scale-enter"
      >
        {/* Search input field */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border-default)", padding: "14px 18px" }}>
          <span style={{ fontSize: "16px", marginRight: "10px", color: "var(--text-tertiary)" }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type pages, tasks, lessons, or commands..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "14px"
            }}
          />
          <kbd
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-default)",
              borderRadius: "4px",
              padding: "2px 6px",
              fontSize: "11px",
              color: "var(--text-tertiary)"
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Categories Tabs Selector */}
        <div style={{ display: "flex", gap: "6px", padding: "10px 18px", borderBottom: "1px solid var(--border-subtle)", overflowX: "auto" }}>
          {["All", "Page", "Project", "Lesson", "Note", "Command"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              style={{
                background: selectedCategory === cat ? "var(--accent)" : "var(--surface-2)",
                color: selectedCategory === cat ? "var(--text-inverse)" : "var(--text-secondary)",
                border: selectedCategory === cat ? "none" : "1px solid var(--border-default)",
                borderRadius: "15px",
                padding: "3px 12px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results layout lists */}
        <div style={{ padding: "8px", maxHeight: "310px", overflowY: "auto" }}>
          
          {/* Empty search suggestions: show recents & favorites */}
          {!searchQuery.trim() && (
            <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {recentPages.length > 0 && (
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Recently Visited Pages
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {recentPages.slice(0, 3).map((path, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigate(path)}
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border-default)",
                          color: "var(--text-primary)",
                          padding: "4px 10px",
                          borderRadius: "15px",
                          fontSize: "11.5px",
                          cursor: "pointer"
                        }}
                      >
                        ⏱️ {PAGES_LIST.find(p => p.path === path)?.title || path.replace("/", "")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {favorites.length > 0 && (
                <div>
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    ⭐️ Saved Favorites
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {favorites.map((path, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigate(path)}
                        style={{
                          background: "var(--accent-subtle)",
                          border: "1px solid var(--accent-gold)",
                          color: "var(--text-primary)",
                          padding: "4px 10px",
                          borderRadius: "15px",
                          fontSize: "11.5px",
                          cursor: "pointer"
                        }}
                      >
                        ⭐️ {PAGES_LIST.find(p => p.path === path)?.title || path.replace("/", "")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search results mapper */}
          {searchResults.length > 0 ? (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    background: isSelected ? "var(--surface-3)" : "none",
                    borderLeft: `3px solid ${isSelected ? "var(--accent-gold)" : "transparent"}`,
                    color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: isSelected ? "700" : "500" }}>{item.title}</span>
                  <span
                    style={{
                      fontSize: "9.5px",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: isSelected ? "var(--accent-subtle)" : "var(--surface-2)",
                      color: isSelected ? "var(--accent-gold)" : "var(--text-tertiary)",
                      fontWeight: "700"
                    }}
                  >
                    {item.type}
                  </span>
                </div>
              );
            })
          ) : (
            searchQuery.trim() && (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-tertiary)" }}>
                <span>No matching documents found for "{searchQuery}"</span>
              </div>
            )
          )}
        </div>

        {/* Footer info navigation shortcuts */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", background: "var(--surface-2)", borderTop: "1px solid var(--border-default)", fontSize: "11px", color: "var(--text-tertiary)" }}>
          <span>↑↓ Arrow keys to navigate • Enter to select</span>
          <span>Close on Esc key</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CommandPalette);
