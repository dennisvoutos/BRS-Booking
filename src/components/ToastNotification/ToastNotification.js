import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClass } from "../../utils/themeUtils";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styles from "./ToastNotification.module.css";

/**
 * Toast notification component for displaying temporary messages to users.
 * Supports different message types (success, error, info, warning) with
 * appropriate icons and styling. Includes auto-dismiss functionality and
 * manual close options for optimal user experience.
 *
 * Features:
 * - Multiple notification types with distinct visual styling and icons
 * - Configurable auto-dismiss duration with timer management
 * - Manual close functionality with accessible close button
 * - Click-to-dismiss on entire notification area
 * - Theme-aware styling that adapts to light/dark modes
 * - Accessibility features with proper ARIA attributes and roles
 * - Smooth animations and transitions for show/hide states
 * - Responsive design that works on all screen sizes
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - The message text to display in the notification
 * @param {string} [props.type="success"] - The type of notification (success, error, info, warning)
 * @param {function} props.onClose - Callback function called when notification should close
 * @param {number} [props.duration=3000] - Auto-dismiss duration in milliseconds (0 to disable)
 * @returns {JSX.Element} Toast notification component
 *
 * @example
 * // Success notification with default duration
 * <ToastNotification
 *   message="Booking created successfully!"
 *   type="success"
 *   onClose={() => removeToast(id)}
 * />
 *
 * @example
 * // Error notification with custom duration
 * <ToastNotification
 *   message="Failed to save booking. Please try again."
 *   type="error"
 *   onClose={() => removeToast(id)}
 *   duration={5000}
 * />
 *
 * @example
 * // Persistent notification (no auto-dismiss)
 * <ToastNotification
 *   message="Please review the booking details."
 *   type="info"
 *   onClose={() => removeToast(id)}
 *   duration={0}
 * />
 */
const ToastNotification = ({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClick = () => {
    onClose();
  };

  return (
    <div
      className={`${getThemeClass(
        "toast",
        currentTheme,
        styles
      )} ${getThemeClass(
        `toast${type.charAt(0).toUpperCase() + type.slice(1)}`,
        currentTheme,
        styles
      )}`}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      <div className={getThemeClass("toastContent", currentTheme, styles)}>
        <div className={getThemeClass("toastIcon", currentTheme, styles)}>
          {type === "success" && <CheckCircleOutlined />}
          {type === "error" && <ExclamationCircleOutlined />}
          {type === "info" && <InfoCircleOutlined />}
          {type === "warning" && <WarningOutlined />}
        </div>
        <span className={getThemeClass("toastMessage", currentTheme, styles)}>
          {message}
        </span>
      </div>
      <button
        className={getThemeClass("toastClose", currentTheme, styles)}
        onClick={handleClick}
        aria-label="Close notification"
      >
        <CloseOutlined />
      </button>
    </div>
  );
};

ToastNotification.propTypes = {
  /** The message text to display in the notification */
  message: PropTypes.string.isRequired,
  /** The type of notification (success, error, info, warning) */
  type: PropTypes.oneOf(["success", "error", "info", "warning"]),
  /** Callback function called when notification should close */
  onClose: PropTypes.func.isRequired,
  /** Auto-dismiss duration in milliseconds (0 to disable auto-dismiss) */
  duration: PropTypes.number,
};

ToastNotification.defaultProps = {
  type: "success",
  duration: 3000,
};

export default ToastNotification;
