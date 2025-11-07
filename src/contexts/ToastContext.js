import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import ToastNotification from "../components/ToastNotification/ToastNotification";

/**
 * Toast context that provides notification functionality throughout the application.
 * Manages a queue of toast notifications with automatic lifecycle management.
 */
const ToastContext = createContext();

/**
 * Custom hook to access toast notification functionality.
 * Must be used within a ToastProvider component tree.
 *
 * @returns {Object} Toast context object with notification functions
 * @returns {function} returns.addToast - Add a new toast with custom type and duration
 * @returns {function} returns.removeToast - Remove a specific toast by ID
 * @returns {function} returns.showSuccess - Show success toast notification
 * @returns {function} returns.showError - Show error toast notification
 * @returns {function} returns.showInfo - Show info toast notification
 * @returns {function} returns.showWarning - Show warning toast notification
 *
 * @throws {Error} Throws error if used outside ToastProvider
 *
 * @example
 * // Basic usage in a component
 * const { showSuccess, showError } = useToast();
 *
 * // Show different types of notifications
 * showSuccess('Operation completed successfully!');
 * showError('Something went wrong. Please try again.');
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

/**
 * Toast provider component that wraps the application and provides notification functionality.
 * Manages a queue of toast notifications and renders them with proper positioning and lifecycle.
 *
 * Features:
 * - Queue-based notification system with unique ID management
 * - Multiple notification types with distinct styling
 * - Configurable auto-dismiss duration per notification
 * - Automatic cleanup and memory management
 * - Accessible notification positioning and stacking
 * - Helper methods for common notification patterns
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to provide toast context to
 * @returns {JSX.Element} Provider component with notification overlay
 *
 * @example
 * // Basic usage wrapping the entire app
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message, duration) =>
    addToast(message, "success", duration);
  const showError = (message, duration) => addToast(message, "error", duration);
  const showWarning = (message, duration) =>
    addToast(message, "warning", duration);
  const showInfo = (message, duration) => addToast(message, "info", duration);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <div style={{ position: "fixed", top: 0, right: 0, zIndex: 1100 }}>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * 70}px)`,
              transition: "transform 0.2s ease",
            }}
          >
            <ToastNotification
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  /** Child components to provide toast context to */
  children: PropTypes.node.isRequired,
};
