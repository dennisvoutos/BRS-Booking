import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClass } from "../../utils/themeUtils";
import { trapFocus } from "../../utils/accessibility";
import {
  CloseOutlined,
  TableOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import styles from "./WelcomeModal.module.css";

/**
 * Welcome Modal component that introduces new users to the booking system features
 * Shows only on first visit per session and highlights key functionality
 *
 * Features introduced:
 * - View switching (Table/Card modes)
 * - Booking creation and management
 * - Search and filtering capabilities
 * - Status management and actions
 * - Responsive design benefits
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {function} props.onClose - Callback function when modal is closed
 * @returns {JSX.Element|null} WelcomeModal component or null if not open
 *
 * @example
 * <WelcomeModal
 *   isOpen={showWelcome}
 *   onClose={() => setShowWelcome(false)}
 * />
 */
const WelcomeModal = ({ isOpen, onClose }) => {
  const { currentTheme } = useTheme();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Focus management
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Trap focus within modal
    const cleanup = trapFocus(modalRef.current);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      cleanup?.();
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const features = [
    {
      icon: <TableOutlined />,
      title: "Flexible Views",
      description:
        "Switch between table and card views for optimal viewing on any device size.",
      highlight: "Perfect for desktop and mobile",
    },
    {
      icon: <PlusOutlined />,
      title: "Easy Booking Creation",
      description:
        "Create new vessel bookings quickly with our intuitive form system.",
      highlight: "Smart validation included",
    },
    {
      icon: <SearchOutlined />,
      title: "Powerful Search & Filters",
      description:
        "Find bookings instantly with real-time search and advanced filtering options.",
      highlight: "Search by customer, vessel, or date",
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Status Management",
      description:
        "Easily update booking status between pending, confirmed, and cancelled states.",
      highlight: "One-click status changes",
    },
    {
      icon: <EditOutlined />,
      title: "Complete Booking Control",
      description:
        "View detailed information, edit bookings, and manage your entire vessel schedule.",
      highlight: "Full CRUD operations",
    },
    {
      icon: <EyeOutlined />,
      title: "Accessibility First",
      description:
        "Fully accessible design with keyboard navigation and screen reader support.",
      highlight: "WCAG compliant",
    },
  ];

  return (
    <div
      className={getThemeClass("modalOverlay", currentTheme, styles)}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      aria-describedby="welcome-modal-description"
    >
      <div
        ref={modalRef}
        className={getThemeClass("welcomeModal", currentTheme, styles)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.iconContainer}>
              <RocketOutlined className={styles.welcomeIcon} />
            </div>
            <div>
              <h1
                id="welcome-modal-title"
                className={getThemeClass("modalTitle", currentTheme, styles)}
              >
                Welcome to BRS Booking System
              </h1>
              <p
                id="welcome-modal-description"
                className={getThemeClass("modalSubtitle", currentTheme, styles)}
              >
                Your comprehensive vessel booking management solution
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className={getThemeClass("closeButton", currentTheme, styles)}
            aria-label="Close welcome modal"
            title="Close welcome modal"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Features Grid */}
        <div className={styles.modalBody}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={getThemeClass("featureCard", currentTheme, styles)}
              >
                <div
                  className={getThemeClass("featureIcon", currentTheme, styles)}
                >
                  {feature.icon}
                </div>
                <div className={styles.featureContent}>
                  <h3
                    className={getThemeClass(
                      "featureTitle",
                      currentTheme,
                      styles
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={getThemeClass(
                      "featureDescription",
                      currentTheme,
                      styles
                    )}
                  >
                    {feature.description}
                  </p>
                  <span
                    className={getThemeClass(
                      "featureHighlight",
                      currentTheme,
                      styles
                    )}
                  >
                    ✨ {feature.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className={getThemeClass("tipsSection", currentTheme, styles)}>
          <h3 className={getThemeClass("tipsTitle", currentTheme, styles)}>
            Quick Tips to Get Started
          </h3>
          <div className={styles.tipsList}>
            <div className={getThemeClass("tip", currentTheme, styles)}>
              <TableOutlined className={styles.tipIcon} />
              <span>
                Use the view toggle buttons in the top-right to switch between
                table and card views
              </span>
            </div>
            <div className={getThemeClass("tip", currentTheme, styles)}>
              <PlusOutlined className={styles.tipIcon} />
              <span>
                Click "New Booking" to create your first vessel booking
              </span>
            </div>
            <div className={getThemeClass("tip", currentTheme, styles)}>
              <SearchOutlined className={styles.tipIcon} />
              <span>
                Use the search bar to quickly find bookings by customer name or
                vessel
              </span>
            </div>
            <div className={getThemeClass("tip", currentTheme, styles)}>
              <FilterOutlined className={styles.tipIcon} />
              <span>
                Filter bookings by status or date range to focus on what matters
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <div className={getThemeClass("footerNote", currentTheme, styles)}>
            💡 This welcome screen appears only once per session. You can always
            access help through the interface.
          </div>
          <button
            onClick={onClose}
            className={getThemeClass("getStartedButton", currentTheme, styles)}
            aria-label="Get started with the booking system"
          >
            <RocketOutlined style={{ marginRight: "8px" }} />
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

WelcomeModal.propTypes = {
  /** Whether the modal is currently open and visible */
  isOpen: PropTypes.bool.isRequired,
  /** Callback function triggered when the modal should be closed */
  onClose: PropTypes.func.isRequired,
};

export default WelcomeModal;
