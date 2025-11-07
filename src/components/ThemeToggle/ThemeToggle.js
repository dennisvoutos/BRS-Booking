import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClass } from "../../utils/themeUtils";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import styles from "./ThemeToggle.module.css";

/**
 * Theme toggle component that allows users to switch between light and dark themes.
 * Provides a visual toggle switch with animated transitions and clear iconography
 * to indicate the current theme state and the action that will be performed on click.
 *
 * Features:
 * - Smooth animated toggle switch with track and thumb design
 * - Clear visual indicators with sun/moon icons for light/dark themes
 * - Accessibility features with proper ARIA labels and keyboard support
 * - Theme-aware styling that adapts to current theme
 * - Customizable CSS classes through className prop
 * - Responsive design that works on all screen sizes
 * - Text labels showing current theme state
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className=""] - Additional CSS classes to apply to the toggle button
 * @returns {JSX.Element} Theme toggle button with animated switch interface
 *
 * @example
 * // Basic usage
 * <ThemeToggle />
 *
 * @example
 * // With custom CSS classes
 * <ThemeToggle className="header-toggle custom-spacing" />
 */
const ThemeToggle = ({ className = "" }) => {
  const { toggleTheme, isDark, currentTheme } = useTheme();

  return (
    <button
      className={`${getThemeClass(
        "themeToggle",
        currentTheme,
        styles
      )} ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className={getThemeClass("themeToggleTrack", currentTheme, styles)}>
        <div
          className={getThemeClass("themeToggleThumb", currentTheme, styles)}
        >
          <div className={styles.themeIcon}>
            {isDark ? (
              <MoonOutlined style={{ fontSize: "16px" }} />
            ) : (
              <SunOutlined style={{ fontSize: "16px" }} />
            )}
          </div>
        </div>
      </div>
      <span className={getThemeClass("themeToggleLabel", currentTheme, styles)}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
};

ThemeToggle.propTypes = {
  /** Additional CSS classes to apply to the toggle button */
  className: PropTypes.string,
};

ThemeToggle.defaultProps = {
  className: "",
};

export default ThemeToggle;
