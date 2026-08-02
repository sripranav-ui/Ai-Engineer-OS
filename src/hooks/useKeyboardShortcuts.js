import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global Keyboard Shortcuts Hook
 * @param {Function} onToggleCheatSheet Callbacks when "?" or "Escape" is toggled
 */
export function useKeyboardShortcuts(onToggleCheatSheet) {
  const navigate = useNavigate();
  const lastKeyRef = useRef(null);
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key events inside inputs, textareas, selects
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      const key = e.key.toLowerCase();

      // Shift + / (which is '?') toggles cheatsheet
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (onToggleCheatSheet) onToggleCheatSheet("toggle");
        return;
      }

      // Escape closes everything
      if (e.key === "Escape") {
        if (onToggleCheatSheet) onToggleCheatSheet("close");
        return;
      }

      // Sequential combination check: Prefix key is "g"
      if (lastKeyRef.current === "g" && now - lastKeyTimeRef.current < 1200) {
        let routed = false;
        
        switch (key) {
          case "d":
            navigate("/");
            routed = true;
            break;
          case "l":
            navigate("/learning");
            routed = true;
            break;
          case "r":
            navigate("/roadmap");
            routed = true;
            break;
          case "p":
            navigate("/planner");
            routed = true;
            break;
          case "w":
            navigate("/coding-workspace");
            routed = true;
            break;
          case "c":
            navigate("/community");
            routed = true;
            break;
          case "j":
            navigate("/career-coach");
            routed = true;
            break;
          case "k":
            navigate("/knowledge");
            routed = true;
            break;
          case "s":
            navigate("/settings");
            routed = true;
            break;
          case "g":
            navigate("/gamification");
            routed = true;
            break;
          case "a":
            navigate("/assistant");
            routed = true;
            break;
          case "t":
            navigate("/portfolio");
            routed = true;
            break;
          case "b":
            navigate("/resume-builder");
            routed = true;
            break;
          case "i":
            navigate("/interview-prep");
            routed = true;
            break;
          case "n":
            navigate("/notes");
            routed = true;
            break;
          case "m":
            navigate("/projects");
            routed = true;
            break;
          case "e":
            navigate("/certificates");
            routed = true;
            break;
          case "y":
            navigate("/placement");
            routed = true;
            break;
          default:
            break;
        }

        if (routed) {
          e.preventDefault();
          lastKeyRef.current = null; // Clear prefix
          return;
        }
      }

      // Track last key pressed
      lastKeyRef.current = key;
      lastKeyTimeRef.current = now;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onToggleCheatSheet]);
}

export default useKeyboardShortcuts;
