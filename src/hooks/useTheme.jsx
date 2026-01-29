// hooks/useTheme.js
import { useState, useEffect } from "react";

const THEMES = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
  { id: "catppuccin-mocha", name: "Catppuccin Mocha" },
  { id: "catppuccin-latte", name: "Catppuccin Latte" },
  { id: "forest", name: "Forest" },
  { id: "gruvbox", name: "Gruvbox" },
];

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem("musicme-theme");
    if (savedTheme && THEMES.find((t) => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const setTheme = (themeId) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(themeId);
      localStorage.setItem("musicme-theme", themeId);
      document.documentElement.setAttribute("data-theme", themeId);
    }
  };

  const toggleThemePicker = () => {
    setShowThemePicker(!showThemePicker);
  };

  return {
    currentTheme,
    themes: THEMES,
    setTheme,
    showThemePicker,
    toggleThemePicker,
  };
};
