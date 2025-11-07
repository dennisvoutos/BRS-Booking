import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { validateBookingForm } from "../../utils/bookingUtils";
import { BOOKING_STATUSES } from "../../data/mockBookings";
import { trapFocus, liveRegionManager } from "../../utils/accessibility";
import { getThemeClass } from "../../utils/themeUtils";
import {
  CloseOutlined,
  UserOutlined,
  CarOutlined,
  CalendarOutlined,
  SaveOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import styles from "./CreateBookingForm.module.css";

/**
 * Modal form component for creating new bookings or editing existing ones.
 * Provides a comprehensive form interface with validation, accessibility features,
 * and responsive design. Supports both create and edit modes with proper form
 * state management and error handling.
 *
 * Features:
 * - Create new bookings with full validation
 * - Edit existing bookings with pre-populated data
 * - Real-time form validation with error display
 * - Accessibility features including focus trapping and ARIA attributes
 * - Responsive modal design that works on all screen sizes
 * - Keyboard navigation support with Escape key to close
 * - Form state persistence during editing
 * - Clean form reset after successful submission
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the form modal is currently open
 * @param {function} props.onClose - Callback function called when form should close
 * @param {function} props.onSubmit - Callback function called when form is submitted with valid data
 * @param {Object} [props.editingBooking] - Optional booking object to edit (enables edit mode)
 * @param {string} [props.editingBooking.id] - Booking ID for editing
 * @param {string} [props.editingBooking.customer] - Customer name
 * @param {string} [props.editingBooking.vessel] - Vessel name
 * @param {string} [props.editingBooking.status] - Booking status
 * @param {string} [props.editingBooking.startDate] - Start date in YYYY-MM-DD format
 * @param {string} [props.editingBooking.endDate] - End date in YYYY-MM-DD format
 * @returns {JSX.Element|null} Form modal component or null if not open
 *
 * @example
 * // Create new booking mode
 * <CreateBookingForm
 *   isOpen={true}
 *   onClose={() => setFormOpen(false)}
 *   onSubmit={(bookingData) => handleCreateBooking(bookingData)}
 * />
 *
 * @example
 * // Edit existing booking mode
 * <CreateBookingForm
 *   isOpen={true}
 *   onClose={() => setFormOpen(false)}
 *   onSubmit={(bookingData) => handleUpdateBooking(bookingData)}
 *   editingBooking={{
 *     id: 'BK-001',
 *     customer: 'John Doe',
 *     vessel: 'Ocean Explorer',
 *     status: 'confirmed',
 *     startDate: '2024-01-15',
 *     endDate: '2024-01-20'
 *   }}
 * />
 */
const CreateBookingForm = ({ isOpen, onClose, onSubmit, editingBooking }) => {
  const { currentTheme } = useTheme();
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    customer: "",
    vessel: "",
    status: "pending",
    startDate: "",
    endDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Focus management and accessibility
  useEffect(() => {
    if (!isOpen) return;

    // Announce form opening
    liveRegionManager.announce(
      editingBooking
        ? "Edit booking form opened"
        : "Create booking form opened",
      "polite"
    );

    // Set up focus trap
    const cleanup = modalRef.current ? trapFocus(modalRef.current) : null;

    return () => {
      if (cleanup) cleanup();
      liveRegionManager.announce(
        editingBooking
          ? "Edit booking form closed"
          : "Create booking form closed",
        "polite"
      );
    };
  }, [isOpen, editingBooking]);

  // Announce form validation errors
  useEffect(() => {
    const errorCount = Object.keys(errors).length;
    if (errorCount > 0) {
      liveRegionManager.announce(
        `Form has ${errorCount} validation error${errorCount > 1 ? "s" : ""}`,
        "assertive"
      );
    }
  }, [errors]);

  // Announce submission status
  useEffect(() => {
    if (submitMessage) {
      liveRegionManager.announce(submitMessage, "assertive");
    }
  }, [submitMessage]);

  // Populate form when editing
  useEffect(() => {
    if (editingBooking) {
      // Format dates for input fields (YYYY-MM-DD format)
      const startDate = new Date(editingBooking.startDate)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(editingBooking.endDate)
        .toISOString()
        .split("T")[0];

      setFormData({
        customer: editingBooking.customer || "",
        vessel: editingBooking.vessel || "",
        status: editingBooking.status || "pending",
        startDate: startDate,
        endDate: endDate,
      });
    } else {
      // Reset form for new booking
      setFormData({
        customer: "",
        vessel: "",
        status: "pending",
        startDate: "",
        endDate: "",
      });
    }
    // Clear errors when switching between create/edit
    setErrors({});
  }, [editingBooking]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const result = await onSubmit(formData);

      if (result.success) {
        setSubmitMessage("Booking created successfully!");
        // Reset form
        setFormData({
          customer: "",
          vessel: "",
          status: "pending",
          startDate: "",
          endDate: "",
        });
        setErrors({});

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setSubmitMessage("");
        }, 1500);
      } else {
        setSubmitMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ESC key
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={getThemeClass("modalOverlay", currentTheme, styles)}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-booking-title"
    >
      <div
        className={getThemeClass("modalContent", currentTheme, styles)}
        ref={modalRef}
      >
        <div className={getThemeClass("modalHeader", currentTheme, styles)}>
          <h2
            id="create-booking-title"
            className={getThemeClass("modalTitle", currentTheme, styles)}
          >
            {editingBooking ? (
              <>
                <EditOutlined style={{ marginRight: "8px" }} />
                Edit Booking
              </>
            ) : (
              <>
                <PlusOutlined style={{ marginRight: "8px" }} />
                Create New Booking
              </>
            )}
          </h2>
          <button
            className={getThemeClass("modalClose", currentTheme, styles)}
            onClick={onClose}
            aria-label="Close create booking form"
            type="button"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.bookingForm}>
            {/* Customer Name Field */}
            <div className={styles.formGroup}>
              <label
                htmlFor="customer"
                className={getThemeClass("formLabel", currentTheme, styles)}
              >
                <UserOutlined style={{ marginRight: "8px" }} />
                Customer Name *
              </label>
              <input
                type="text"
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className={`${getThemeClass(
                  "formInput",
                  currentTheme,
                  styles
                )} ${
                  errors.customer
                    ? getThemeClass("formInputError", currentTheme, styles)
                    : ""
                }`}
                placeholder="Enter customer name"
                disabled={isSubmitting}
                autoComplete="organization"
              />
              {errors.customer && (
                <span
                  className={getThemeClass(
                    "errorMessage",
                    currentTheme,
                    styles
                  )}
                  role="alert"
                >
                  {errors.customer}
                </span>
              )}
            </div>

            {/* Vessel Name Field */}
            <div className={styles.formGroup}>
              <label
                htmlFor="vessel"
                className={getThemeClass("formLabel", currentTheme, styles)}
              >
                <CarOutlined style={{ marginRight: "8px" }} />
                Vessel Name *
              </label>
              <input
                type="text"
                id="vessel"
                name="vessel"
                value={formData.vessel}
                onChange={handleChange}
                className={`${getThemeClass(
                  "formInput",
                  currentTheme,
                  styles
                )} ${
                  errors.vessel
                    ? getThemeClass("formInputError", currentTheme, styles)
                    : ""
                }`}
                placeholder="Enter vessel name"
                disabled={isSubmitting}
                autoComplete="off"
              />
              {errors.vessel && (
                <span
                  className={getThemeClass(
                    "errorMessage",
                    currentTheme,
                    styles
                  )}
                  role="alert"
                >
                  {errors.vessel}
                </span>
              )}
            </div>

            {/* Status Field */}
            <div className={styles.formGroup}>
              <label
                htmlFor="status"
                className={getThemeClass("formLabel", currentTheme, styles)}
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={getThemeClass("formSelect", currentTheme, styles)}
                disabled={isSubmitting}
              >
                {BOOKING_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Fields */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label
                  htmlFor="startDate"
                  className={getThemeClass("formLabel", currentTheme, styles)}
                >
                  <CalendarOutlined style={{ marginRight: "8px" }} />
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`${getThemeClass(
                    "formInput",
                    currentTheme,
                    styles
                  )} ${
                    errors.startDate
                      ? getThemeClass("formInputError", currentTheme, styles)
                      : ""
                  }`}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                />
                {errors.startDate && (
                  <span
                    className={getThemeClass(
                      "errorMessage",
                      currentTheme,
                      styles
                    )}
                    role="alert"
                  >
                    {errors.startDate}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label
                  htmlFor="endDate"
                  className={getThemeClass("formLabel", currentTheme, styles)}
                >
                  <CalendarOutlined style={{ marginRight: "8px" }} />
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`${getThemeClass(
                    "formInput",
                    currentTheme,
                    styles
                  )} ${
                    errors.endDate
                      ? getThemeClass("formInputError", currentTheme, styles)
                      : ""
                  }`}
                  disabled={isSubmitting}
                  min={
                    formData.startDate || new Date().toISOString().split("T")[0]
                  }
                />
                {errors.endDate && (
                  <span
                    className={getThemeClass(
                      "errorMessage",
                      currentTheme,
                      styles
                    )}
                    role="alert"
                  >
                    {errors.endDate}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={getThemeClass(
                  submitMessage.includes("Error")
                    ? "submitMessageError"
                    : "submitMessageSuccess",
                  currentTheme,
                  styles
                )}
              >
                {submitMessage.includes("Error") ? (
                  <ExclamationCircleOutlined style={{ marginRight: "8px" }} />
                ) : (
                  <CheckCircleOutlined style={{ marginRight: "8px" }} />
                )}
                {submitMessage}
              </div>
            )}

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onClose}
                className={getThemeClass("btnSecondary", currentTheme, styles)}
                disabled={isSubmitting}
              >
                <CloseOutlined style={{ marginRight: "8px" }} />
                Cancel
              </button>
              <button
                type="submit"
                className={getThemeClass("btnPrimary", currentTheme, styles)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  editingBooking ? (
                    <>
                      <SaveOutlined style={{ marginRight: "8px" }} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <PlusOutlined style={{ marginRight: "8px" }} />
                      Creating...
                    </>
                  )
                ) : editingBooking ? (
                  <>
                    <SaveOutlined style={{ marginRight: "8px" }} />
                    Update Booking
                  </>
                ) : (
                  <>
                    <PlusOutlined style={{ marginRight: "8px" }} />
                    Create Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreateBookingForm.propTypes = {
  /** Whether the form modal is currently open */
  isOpen: PropTypes.bool.isRequired,
  /** Callback function called when form should close */
  onClose: PropTypes.func.isRequired,
  /** Callback function called when form is submitted with valid data */
  onSubmit: PropTypes.func.isRequired,
  /** Optional booking object to edit (enables edit mode) */
  editingBooking: PropTypes.shape({
    /** Booking ID for editing */
    id: PropTypes.string.isRequired,
    /** Customer name */
    customer: PropTypes.string.isRequired,
    /** Vessel name */
    vessel: PropTypes.string.isRequired,
    /** Booking status */
    status: PropTypes.oneOf(["confirmed", "pending", "cancelled"]).isRequired,
    /** Start date in YYYY-MM-DD format */
    startDate: PropTypes.string.isRequired,
    /** End date in YYYY-MM-DD format */
    endDate: PropTypes.string.isRequired,
  }),
};

export default CreateBookingForm;
