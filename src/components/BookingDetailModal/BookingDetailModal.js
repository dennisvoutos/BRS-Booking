import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import {
  formatDateRange,
  calculateDuration,
  getStatusColor,
  getStatusBgColor,
} from "../../utils/bookingUtils";
import { trapFocus, liveRegionManager } from "../../utils/accessibility";
import { getThemeClass } from "../../utils/themeUtils";
import {
  CloseOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  CarOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  LoadingOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import styles from "./BookingDetailModal.module.css";

/**
 * Comprehensive modal component for displaying and managing booking details.
 * Provides functionality to view booking information, update booking status,
 * delete bookings, and navigate to edit mode. Includes accessibility features,
 * loading states, and error handling with simulated API interactions.
 *
 * Features:
 * - Complete booking information display with formatted dates and duration
 * - Status management with visual indicators and color coding
 * - Action buttons for editing, confirming, and deleting bookings
 * - Accessibility features including focus trapping and ARIA attributes
 * - Responsive design that works on all screen sizes
 * - Loading states for all async operations
 * - Error handling with toast notifications
 * - Keyboard navigation support with Escape key to close
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.booking - The booking object to display
 * @param {string} props.booking.id - Unique booking identifier
 * @param {string} props.booking.customer - Customer name
 * @param {string} props.booking.vessel - Vessel name
 * @param {string} props.booking.status - Booking status (confirmed, pending, cancelled)
 * @param {string} props.booking.startDate - Start date in YYYY-MM-DD format
 * @param {string} props.booking.endDate - End date in YYYY-MM-DD format
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {function} props.onClose - Callback function called when modal should close
 * @param {function} props.updateBookingStatus - Function to update booking status
 * @param {function} props.deleteBooking - Function to delete a booking
 * @param {function} props.onEdit - Function to navigate to edit mode
 * @returns {JSX.Element|null} Modal component or null if not open
 *
 * @example
 * // Basic usage with required props
 * <BookingDetailModal
 *   booking={{
 *     id: 'BK-001',
 *     customer: 'John Doe',
 *     vessel: 'Ocean Explorer',
 *     status: 'confirmed',
 *     startDate: '2024-01-15',
 *     endDate: '2024-01-20'
 *   }}
 *   isOpen={true}
 *   onClose={() => setModalOpen(false)}
 *   updateBookingStatus={(id, status) => console.log('Update:', id, status)}
 *   deleteBooking={(id) => console.log('Delete:', id)}
 *   onEdit={(booking) => console.log('Edit:', booking)}
 * />
 */
const BookingDetailModal = ({
  booking,
  isOpen,
  onClose,
  updateBookingStatus,
  deleteBooking,
  onEdit,
}) => {
  const { currentTheme } = useTheme();
  const { showError } = useToast();
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle confirmed deletion
  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    console.log("Deleting booking:", booking.id);
    simulateAPICall("delete booking", deleteBooking, booking.id);
  };

  // Simulate API call with loading state
  const simulateAPICall = async (action, apiFunction, ...args) => {
    setIsLoading(true);
    setLoadingAction(action);

    try {
      // Simulate network delay
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 1200)
      );

      // Call the actual API function
      const result = await apiFunction(...args);

      if (result.success) {
        console.log(`Successfully completed ${action}`);
        // Close modal after successful action (except for edit)
        if (action !== "edit") {
          setTimeout(() => {
            onClose();
          }, 300);
        }
      } else {
        console.error(`Failed to ${action}:`, result.error);
        showError(`Failed to ${action}: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      showError(`Error during ${action}: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    // Announce modal opening to screen readers
    liveRegionManager.announce(
      `Booking details modal opened for ${booking?.customer}`,
      "polite"
    );

    document.addEventListener("keydown", handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Set up focus trap
    const cleanup = modalRef.current ? trapFocus(modalRef.current) : null;

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      if (cleanup) cleanup();
      // Announce modal closing
      liveRegionManager.announce("Booking details modal closed", "polite");
    };
  }, [isOpen, onClose, booking, isLoading]);

  // Don't render if not open or no booking
  if (!isOpen || !booking) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const duration = calculateDuration(booking.startDate, booking.endDate);
  const statusColor = getStatusColor(booking.status);
  const statusBgColor = getStatusBgColor(booking.status);

  return (
    <div
      className={getThemeClass("modalOverlay", currentTheme, styles)}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={getThemeClass("modalContent", currentTheme, styles)}
        ref={modalRef}
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleSection}>
            <h2
              id="modal-title"
              className={getThemeClass("modalTitle", currentTheme, styles)}
            >
              Booking Details
            </h2>
            <div className={styles.bookingIdBadge}>{booking.id}</div>
          </div>
          <button
            className={getThemeClass("modalCloseBtn", currentTheme, styles)}
            onClick={onClose}
            aria-label="Close booking details"
            disabled={isLoading}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Status Section */}
          <div className={styles.detailSection}>
            <h3 className={getThemeClass("sectionTitle", currentTheme, styles)}>
              Status
            </h3>
            <div className={styles.statusContainer}>
              <span
                className={styles.statusBadgeLarge}
                style={{
                  backgroundColor: statusBgColor,
                  color: statusColor,
                  border: `1px solid ${statusColor}20`,
                }}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Customer & Vessel Information */}
          <div className={styles.detailGrid}>
            <div className={styles.detailSection}>
              <h3
                className={getThemeClass("sectionTitle", currentTheme, styles)}
              >
                <UserOutlined style={{ marginRight: "8px" }} />
                Customer
              </h3>
              <p className={getThemeClass("detailValue", currentTheme, styles)}>
                {booking.customer}
              </p>
            </div>

            <div className={styles.detailSection}>
              <h3
                className={getThemeClass("sectionTitle", currentTheme, styles)}
              >
                <CarOutlined style={{ marginRight: "8px" }} />
                Vessel
              </h3>
              <p className={getThemeClass("detailValue", currentTheme, styles)}>
                {booking.vessel}
              </p>
            </div>
          </div>

          {/* Date Information */}
          <div className={styles.detailSection}>
            <h3 className={getThemeClass("sectionTitle", currentTheme, styles)}>
              <CalendarOutlined style={{ marginRight: "8px" }} />
              Booking Period
            </h3>
            <div className={styles.dateInfoGrid}>
              <div className={styles.dateItem}>
                <span
                  className={getThemeClass("dateLabel", currentTheme, styles)}
                >
                  Start Date
                </span>
                <span
                  className={getThemeClass("dateValue", currentTheme, styles)}
                >
                  {new Date(booking.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className={styles.dateItem}>
                <span
                  className={getThemeClass("dateLabel", currentTheme, styles)}
                >
                  End Date
                </span>
                <span
                  className={getThemeClass("dateValue", currentTheme, styles)}
                >
                  {new Date(booking.endDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className={styles.dateItem}>
                <span
                  className={getThemeClass("dateLabel", currentTheme, styles)}
                >
                  Duration
                </span>
                <span
                  className={`${getThemeClass(
                    "dateValue",
                    currentTheme,
                    styles
                  )} ${getThemeClass(
                    "durationHighlight",
                    currentTheme,
                    styles
                  )}`}
                >
                  {duration} day{duration !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className={`${styles.detailSection} ${styles.summarySection}`}>
            <h3 className={getThemeClass("sectionTitle", currentTheme, styles)}>
              <InfoCircleOutlined style={{ marginRight: "8px" }} />
              Booking Summary
            </h3>
            <div className={getThemeClass("summaryCard", currentTheme, styles)}>
              <div className={styles.summaryRow}>
                <span
                  className={getThemeClass(
                    "summaryLabel",
                    currentTheme,
                    styles
                  )}
                >
                  Booking ID:
                </span>
                <span
                  className={getThemeClass(
                    "summaryValue",
                    currentTheme,
                    styles
                  )}
                >
                  {booking.id}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span
                  className={getThemeClass(
                    "summaryLabel",
                    currentTheme,
                    styles
                  )}
                >
                  Customer:
                </span>
                <span
                  className={getThemeClass(
                    "summaryValue",
                    currentTheme,
                    styles
                  )}
                >
                  {booking.customer}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span
                  className={getThemeClass(
                    "summaryLabel",
                    currentTheme,
                    styles
                  )}
                >
                  Vessel:
                </span>
                <span
                  className={getThemeClass(
                    "summaryValue",
                    currentTheme,
                    styles
                  )}
                >
                  {booking.vessel}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span
                  className={getThemeClass(
                    "summaryLabel",
                    currentTheme,
                    styles
                  )}
                >
                  Period:
                </span>
                <span
                  className={getThemeClass(
                    "summaryValue",
                    currentTheme,
                    styles
                  )}
                >
                  {formatDateRange(booking.startDate, booking.endDate)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span
                  className={getThemeClass(
                    "summaryLabel",
                    currentTheme,
                    styles
                  )}
                >
                  Duration:
                </span>
                <span
                  className={getThemeClass(
                    "summaryValue",
                    currentTheme,
                    styles
                  )}
                >
                  {duration} day{duration !== 1 ? "s" : ""}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span
                  className={getThemeClass(
                    "summaryLabel",
                    currentTheme,
                    styles
                  )}
                >
                  Status:
                </span>
                <span
                  className={getThemeClass(
                    "summaryValue",
                    currentTheme,
                    styles
                  )}
                >
                  <span
                    className={styles.statusBadgeSmall}
                    style={{
                      backgroundColor: statusBgColor,
                      color: statusColor,
                    }}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={getThemeClass("modalFooter", currentTheme, styles)}>
          <div className={styles.actionButtons}>
            {/* Edit Button - Available for ALL bookings */}
            <button
              className={getThemeClass("btnPrimary", currentTheme, styles)}
              onClick={() => {
                console.log("Edit booking:", booking.id);
                if (onEdit) {
                  onEdit(booking);
                }
              }}
              disabled={isLoading}
            >
              <EditOutlined style={{ marginRight: "8px" }} />
              Edit Booking
            </button>

            {/* Status Change Actions */}
            {booking.status === "pending" && (
              <button
                className={getThemeClass("btnSuccess", currentTheme, styles)}
                onClick={() => {
                  console.log("Confirming booking:", booking.id);
                  simulateAPICall(
                    "confirm booking",
                    updateBookingStatus,
                    booking.id,
                    "confirmed"
                  );
                }}
                disabled={isLoading}
              >
                {isLoading && loadingAction === "confirm booking" ? (
                  <LoadingOutlined style={{ marginRight: "8px" }} />
                ) : (
                  <CheckCircleOutlined style={{ marginRight: "8px" }} />
                )}
                {isLoading && loadingAction === "confirm booking"
                  ? "Confirming..."
                  : "Confirm Booking"}
              </button>
            )}

            {booking.status === "confirmed" && (
              <button
                className={getThemeClass("btnWarning", currentTheme, styles)}
                onClick={() => {
                  console.log("Making booking pending:", booking.id);
                  simulateAPICall(
                    "make pending",
                    updateBookingStatus,
                    booking.id,
                    "pending"
                  );
                }}
                disabled={isLoading}
              >
                {isLoading && loadingAction === "make pending" ? (
                  <LoadingOutlined style={{ marginRight: "8px" }} />
                ) : (
                  <ClockCircleOutlined style={{ marginRight: "8px" }} />
                )}
                {isLoading && loadingAction === "make pending"
                  ? "Updating..."
                  : "Make Pending"}
              </button>
            )}

            {booking.status === "cancelled" && (
              <button
                className={getThemeClass("btnSuccess", currentTheme, styles)}
                onClick={() => {
                  console.log("Restoring booking to pending:", booking.id);
                  simulateAPICall(
                    "restore to pending",
                    updateBookingStatus,
                    booking.id,
                    "pending"
                  );
                }}
                disabled={isLoading}
              >
                {isLoading && loadingAction === "restore to pending" ? (
                  <LoadingOutlined style={{ marginRight: "8px" }} />
                ) : (
                  <ReloadOutlined style={{ marginRight: "8px" }} />
                )}
                {isLoading && loadingAction === "restore to pending"
                  ? "Restoring..."
                  : "Restore to Pending"}
              </button>
            )}

            {/* Cancel/Delete Actions */}
            {booking.status !== "cancelled" && (
              <button
                className={getThemeClass("btnDanger", currentTheme, styles)}
                onClick={() => {
                  console.log("Cancelling booking:", booking.id);
                  simulateAPICall(
                    "cancel booking",
                    updateBookingStatus,
                    booking.id,
                    "cancelled"
                  );
                }}
                disabled={isLoading}
              >
                {isLoading && loadingAction === "cancel booking" ? (
                  <LoadingOutlined style={{ marginRight: "8px" }} />
                ) : (
                  <StopOutlined style={{ marginRight: "8px" }} />
                )}
                {isLoading && loadingAction === "cancel booking"
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            )}

            {/* Delete Button - Available for cancelled bookings or with confirmation */}
            <button
              className={getThemeClass("btnDanger", currentTheme, styles)}
              onClick={() => {
                if (!isLoading) {
                  setShowDeleteConfirm(true);
                }
              }}
              disabled={isLoading}
            >
              {isLoading && loadingAction === "delete booking" ? (
                <LoadingOutlined style={{ marginRight: "8px" }} />
              ) : (
                <DeleteOutlined style={{ marginRight: "8px" }} />
              )}
              {isLoading && loadingAction === "delete booking"
                ? "Deleting..."
                : "Delete Booking"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={getThemeClass("modalOverlay", currentTheme, styles)}>
          <div
            className={getThemeClass("confirmationModal", currentTheme, styles)}
          >
            <div className={styles.confirmationHeader}>
              <h3 className={styles.confirmationTitle}>Confirm Deletion</h3>
            </div>
            <div className={styles.confirmationBody}>
              <p className={styles.confirmationMessage}>
                Are you sure you want to permanently delete booking{" "}
                <strong>{booking.id}</strong> for customer{" "}
                <strong>{booking.customer}</strong>?
                <br />
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.confirmationActions}>
              <button
                className={getThemeClass("btnSecondary", currentTheme, styles)}
                onClick={() => setShowDeleteConfirm(false)}
              >
                <ClearOutlined style={{ marginRight: "8px" }} />
                Cancel
              </button>
              <button
                className={getThemeClass("btnDanger", currentTheme, styles)}
                onClick={handleConfirmDelete}
              >
                <DeleteOutlined style={{ marginRight: "8px" }} />
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

BookingDetailModal.propTypes = {
  /** The booking object to display */
  booking: PropTypes.shape({
    /** Unique booking identifier */
    id: PropTypes.string.isRequired,
    /** Customer name */
    customer: PropTypes.string.isRequired,
    /** Vessel name */
    vessel: PropTypes.string.isRequired,
    /** Booking status (confirmed, pending, cancelled) */
    status: PropTypes.oneOf(["confirmed", "pending", "cancelled"]).isRequired,
    /** Start date in YYYY-MM-DD format */
    startDate: PropTypes.string.isRequired,
    /** End date in YYYY-MM-DD format */
    endDate: PropTypes.string.isRequired,
  }),
  /** Whether the modal is currently open */
  isOpen: PropTypes.bool.isRequired,
  /** Callback function called when modal should close */
  onClose: PropTypes.func.isRequired,
  /** Function to update booking status */
  updateBookingStatus: PropTypes.func.isRequired,
  /** Function to delete a booking */
  deleteBooking: PropTypes.func.isRequired,
  /** Function to navigate to edit mode */
  onEdit: PropTypes.func.isRequired,
};

export default BookingDetailModal;
