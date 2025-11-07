import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClass } from "../../utils/themeUtils";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "./LoadingSkeleton.module.css";

/**
 * Versatile loading skeleton component that provides placeholder content during
 * data loading states. Supports multiple variants to match different content types
 * and layouts, improving perceived performance and user experience.
 *
 * Features:
 * - Multiple skeleton variants: text, table, card, and spinner
 * - Customizable dimensions (width, height) for flexible layouts
 * - Configurable row count for list-like content
 * - Theme-aware styling with smooth shimmer animations
 * - Responsive design that adapts to container sizes
 * - Accessibility-friendly loading states
 * - Consistent visual hierarchy matching actual content
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.variant="text"] - The skeleton variant (text, table, card, spinner)
 * @param {string|number} [props.width="100%"] - Width of skeleton elements (CSS value)
 * @param {string|number} [props.height="1rem"] - Height of skeleton elements (CSS value)
 * @param {number} [props.rows=1] - Number of skeleton rows to display
 * @param {string} [props.className=""] - Additional CSS classes to apply
 * @returns {JSX.Element} Loading skeleton component with shimmer animation
 *
 * @example
 * // Basic text skeleton
 * <LoadingSkeleton variant="text" rows={3} />
 *
 * @example
 * // Table skeleton for booking data
 * <LoadingSkeleton variant="table" rows={5} />
 *
 * @example
 * // Card skeleton with custom dimensions
 * <LoadingSkeleton
 *   variant="card"
 *   width="300px"
 *   className="custom-skeleton"
 * />
 *
 * @example
 * // Spinner for full-page loading
 * <LoadingSkeleton variant="spinner" />
 */
const LoadingSkeleton = ({
  variant = "text",
  width = "100%",
  height = "1rem",
  rows = 1,
  className = "",
}) => {
  const { currentTheme } = useTheme();

  if (variant === "spinner") {
    return (
      <div
        className={`${getThemeClass(
          "spinnerContainer",
          currentTheme,
          styles
        )} ${className}`}
        style={{ textAlign: "center", padding: "2rem" }}
      >
        <LoadingOutlined style={{ fontSize: "2rem", color: "#1890ff" }} />
        <div style={{ marginTop: "1rem", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={`${getThemeClass(
          "tableSkeletonContainer",
          currentTheme,
          styles
        )} ${className}`}
      >
        {/* Table Header */}
        <div
          className={getThemeClass("tableSkeletonHeader", currentTheme, styles)}
        >
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className={getThemeClass("skeletonElement", currentTheme, styles)}
              style={{ height: "1.25rem", width: "100%" }}
            />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={getThemeClass("tableSkeletonRow", currentTheme, styles)}
          >
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={getThemeClass(
                  "skeletonElement",
                  currentTheme,
                  styles
                )}
                style={{
                  height: "1rem",
                  width:
                    colIndex === 0 ? "80px" : colIndex === 6 ? "60px" : "100%",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`${getThemeClass(
          "cardSkeleton",
          currentTheme,
          styles
        )} ${className}`}
      >
        <div
          className={getThemeClass("cardSkeletonHeader", currentTheme, styles)}
        >
          <div
            className={getThemeClass("skeletonElement", currentTheme, styles)}
            style={{ height: "1.5rem", width: "60%" }}
          />
          <div
            className={getThemeClass("skeletonElement", currentTheme, styles)}
            style={{ height: "1rem", width: "80px" }}
          />
        </div>
        <div
          className={getThemeClass("cardSkeletonBody", currentTheme, styles)}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={getThemeClass("skeletonElement", currentTheme, styles)}
              style={{
                height: "0.875rem",
                width: index === 2 ? "40%" : "100%",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={getThemeClass("skeletonElement", currentTheme, styles)}
          style={{
            width,
            height,
            marginBottom: rows > 1 ? "0.5rem" : "0",
          }}
        />
      ))}
    </div>
  );
};

LoadingSkeleton.propTypes = {
  /** The skeleton variant (text, table, card, spinner) */
  variant: PropTypes.oneOf(["text", "table", "card", "spinner"]),
  /** Width of skeleton elements (CSS value) */
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Height of skeleton elements (CSS value) */
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Number of skeleton rows to display */
  rows: PropTypes.number,
  /** Additional CSS classes to apply */
  className: PropTypes.string,
};

LoadingSkeleton.defaultProps = {
  variant: "text",
  width: "100%",
  height: "1rem",
  rows: 1,
  className: "",
};

export default LoadingSkeleton;
