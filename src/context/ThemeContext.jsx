import React, { createContext, useState, useEffect, useMemo } from "react";
import storageService from "../services/storageService";

export const ThemeContext = createContext();

/**
 * Helper to get initial theme synchronously from localStorage.
 * Default fallback is ALWAYS "light".
 */
const getInitialTheme = () => {
  try {
    const val = localStorage.getItem("theme");
    if (val !== null && val !== undefined) {
      try {
        const parsed = JSON.parse(val);
        if (parsed) return parsed;
      } catch {
        return val;
      }
    }
  } catch (e) {}
  return "light";
};

/**
 * Apply theme classes to html and body elements synchronously
 */
const applyThemeToDOM = (targetTheme) => {
  const themeClass = targetTheme === "light" 
    ? "light-theme" 
    : (targetTheme.startsWith("theme-") ? targetTheme : `theme-${targetTheme}`);

  document.documentElement.className = themeClass;
  document.documentElement.setAttribute("data-theme", targetTheme);

  if (document.body) {
    document.body.className = themeClass;
  }
};

/**
 * Single Source of Truth Theme Management Context Provider
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [accentColor, setAccentColor] = useState(() => storageService.get("accentColor", "#1D1D21"));

  // Ensure DOM matches initial theme state immediately on mount
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    storageService.set("theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", accentColor);
    storageService.set("accentColor", accentColor);
  }, [accentColor]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    accentColor,
    setAccentColor,
  }), [theme, accentColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
