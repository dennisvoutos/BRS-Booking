import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Theme definitions with comprehensive color palettes for light and dark modes.
 * Provides consistent theming across the entire application with carefully
 * chosen colors for optimal accessibility and visual hierarchy.
 */
export const themes = {
  light: {
    name: "light",
    colors: {
      // Background colors - warm beige tones
      background: "#faf8f5",
      surface: "#ffffff",
      surfaceSecondary: "#f5f2ed",
      surfaceTertiary: "#ede8e0",

      // Text colors
      textPrimary: "#2c2825",
      textSecondary: "#5c5651",
      textMuted: "#8a857d",

      // Brand colors
      primary: "#d4995d",
      primaryHover: "#c8864a",
      primaryLight: "#e8c4a0",

      // Accent colors
      accent: "#b8956a",
      accentLight: "#d4c4a5",

      // Status colors
      success: "#7c9885",
      successLight: "#c8d4cb",
      warning: "#d4a574",
      warningLight: "#e8d0b5",
      error: "#c47979",
      errorLight: "#e0c1c1",

      // Neutral colors
      border: "#e0d9d1",
      borderLight: "#ede8e0",
      shadow: "rgba(44, 40, 37, 0.1)",

      // Interactive states
      hover: "#f0ede8",
      active: "#e8e1d8",
      focus: "#d4995d",
    },
  },
  dark: {
    name: "dark",
    colors: {
      // Background colors - dark blue tones
      background: "#0f1419",
      surface: "#1a1f2e",
      surfaceSecondary: "#242b3d",
      surfaceTertiary: "#2d3748",

      // Text colors
      textPrimary: "#f7fafc",
      textSecondary: "#e2e8f0",
      textMuted: "#a0aec0",

      // Brand colors
      primary: "#4a90e2",
      primaryHover: "#357abd",
      primaryLight: "#7bb3f0",

      // Accent colors
      accent: "#5a67d8",
      accentLight: "#9f7aea",

      // Status colors
      success: "#68d391",
      successLight: "#38a169",
      warning: "#ed8936",
      warningLight: "#dd6b20",
      error: "#f56565",
      errorLight: "#e53e3e",

      // Neutral colors
      border: "#4a5568",
      borderLight: "#2d3748",
      shadow: "rgba(0, 0, 0, 0.3)",

      // Interactive states
      hover: "#2d3748",
      active: "#4a5568",
      focus: "#4a90e2",
    },
  },
};

/**
 * Theme context that provides theme state and controls throughout the application.
 * Manages light/dark mode switching with localStorage persistence and system
 * preference detection.
 */
const ThemeContext = createContext();

/**
 * Theme provider component that wraps the application and provides theme functionality.
 * Automatically detects system theme preferences, persists theme choices to localStorage,
 * and provides theme switching capabilities to all child components.
 *
 * Features:
 * - Automatic system theme detection on first visit
 * - LocalStorage persistence for user theme preferences
 * - Dynamic CSS custom property updates for theme switching
 * - Comprehensive theme object with color palettes and design tokens
 * - Graceful handling of SSR and test environments
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to provide theme context to
 * @param {string} [props.initialTheme] - Optional initial theme override (for testing)
 * @returns {JSX.Element} Provider component that wraps children with theme context
 *
 * @example
 * // Basic usage wrapping the entire app
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * @example
 * // With initial theme override (useful for testing)
 * <ThemeProvider initialTheme="dark">
 *   <App />
 * </ThemeProvider>
 */
export const ThemeProvider = ({ children, initialTheme }) => {
  const [currentTheme, setCurrentTheme] = useState(initialTheme || "light");

  // Load theme from localStorage on mount
  useEffect(() => {
    // Skip localStorage logic if initialTheme is provided (for testing)
    if (initialTheme) {
      setCurrentTheme(initialTheme);
      return;
    }

    const savedTheme = localStorage.getItem("brs-theme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      // Check system preference (handle test environment)
      if (typeof window !== "undefined" && window.matchMedia) {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setCurrentTheme(prefersDark ? "dark" : "light");
      } else {
        // Default to light theme in test environment
        setCurrentTheme("light");
      }
    }
  }, [initialTheme]);

  // Apply theme to document root
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    // Set CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set data attribute for theme-specific styling
    root.setAttribute("data-theme", currentTheme);

    // Save to localStorage
    localStorage.setItem("brs-theme", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    toggleTheme,
    setTheme,
    isDark: currentTheme === "dark",
    isLight: currentTheme === "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  /** Child components to provide theme context to */
  children: PropTypes.node.isRequired,
  /** Optional initial theme override (useful for testing) */
  initialTheme: PropTypes.oneOf(["light", "dark"]),
};

/**
 * Custom hook to access theme context and functionality.
 * Must be used within a ThemeProvider component tree.
 *
 * @returns {Object} Theme context object
 * @returns {string} returns.currentTheme - Current active theme name
 * @returns {Object} returns.theme - Current theme object with color palette
 * @returns {Object} returns.themes - All available theme definitions
 * @returns {function} returns.toggleTheme - Function to toggle between light/dark
 * @returns {function} returns.setTheme - Function to set specific theme
 * @returns {boolean} returns.isDark - Whether current theme is dark mode
 * @returns {boolean} returns.isLight - Whether current theme is light mode
 *
 * @throws {Error} Throws error if used outside ThemeProvider
 *
 * @example
 * // Basic usage in a component
 * const { currentTheme, toggleTheme, isDark } = useTheme();
 *
 * @example
 * // Using theme colors
 * const { theme } = useTheme();
 * const backgroundColor = theme.colors.background;
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
