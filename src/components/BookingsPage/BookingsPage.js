import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { useBookings } from "../../hooks/useBookings";
import { formatDateRange, calculateDuration } from "../../utils/bookingUtils";
import { getThemeClass } from "../../utils/themeUtils";
import BookingDetailModal from "../BookingDetailModal/BookingDetailModal";
import CreateBookingForm from "../CreateBookingForm/CreateBookingForm";
import LoadingSkeleton from "../LoadingSkeleton/LoadingSkeleton";
import SearchAndFilters from "../SearchAndFilters/SearchAndFilters";
import {
  PlusOutlined,
  ClearOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import styles from "./BookingsPage.module.css";

/**
 * Main bookings management page component that provides a complete interface for viewing,
 * searching, filtering, and managing vessel bookings. Includes functionality for creating
 * new bookings, editing existing ones, and viewing detailed booking information.
 *
 * Features:
 * - Search and filter functionality with debounced text search
 * - Status-based filtering (confirmed, pending, cancelled)
 * - Date range filtering for booking periods
 * - Sortable booking table with multiple sort options
 * - Responsive design with mobile-friendly table views
 * - Accessibility features including keyboard navigation and screen reader support
 * - Loading states with skeleton components
 * - Error handling with toast notifications
 *
 * @component
 * @returns {JSX.Element} Complete bookings management interface
 *
 * @example
 * // BookingsPage is typically used as the main content area
 * <main>
 *   <BookingsPage />
 * </main>
 */
const BookingsPage = () => {
  const { currentTheme } = useTheme();
  const { showError } = useToast();
  const {
    bookings,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refreshBookings,
    addBooking,
    deleteBooking,
    updateBookingStatus,
    updateBooking,
  } = useBookings();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCreateBooking = () => {
    setShowCreateForm(true);
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setSelectedBooking(null); // Close detail modal
    setShowCreateForm(true); // Open edit form
  };

  const handleFormSubmit = async (bookingData) => {
    if (editingBooking) {
      // Update existing booking
      const result = await updateBooking(editingBooking.id, bookingData);
      if (result.success) {
        setShowCreateForm(false);
        setEditingBooking(null);
      }
      return result;
    } else {
      // Create new booking
      const result = await addBooking(bookingData);
      if (result.success) {
        setShowCreateForm(false);
      }
      return result;
    }
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingBooking(null);
  };

  const handleDeleteBooking = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setBookingToDelete(booking);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBooking = async () => {
    if (bookingToDelete) {
      const result = await deleteBooking(bookingToDelete.id);
      if (result.success) {
        console.log("Successfully deleted booking:", bookingToDelete.id);
      } else {
        console.error("Failed to delete booking:", result.error);
        showError(`Failed to delete booking: ${result.error}`);
      }
    }
    setShowDeleteConfirm(false);
    setBookingToDelete(null);
  };

  const handleStatusToggle = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    let newStatus;
    switch (booking.status) {
      case "pending":
        newStatus = "confirmed";
        break;
      case "confirmed":
        newStatus = "pending";
        break;
      case "cancelled":
        newStatus = "pending";
        break;
      default:
        newStatus = "pending";
    }

    console.log(
      `Changing booking ${bookingId} status from ${booking.status} to ${newStatus}`
    );
    const result = await updateBookingStatus(bookingId, newStatus);
    if (result.success) {
      console.log("Successfully updated booking status:", bookingId);
    } else {
      console.error("Failed to update booking status:", result.error);
      showError(`Failed to update booking status: ${result.error}`);
    }
  };

  const getStatusToggleTooltip = (status) => {
    switch (status) {
      case "pending":
        return "Confirm booking";
      case "confirmed":
        return "Make pending";
      case "cancelled":
        return "Restore to pending";
      default:
        return "Change status";
    }
  };

  const getStatusToggleIcon = (status) => {
    switch (status) {
      case "pending":
        return <CheckCircleOutlined />;
      case "confirmed":
        return <ClockCircleOutlined />;
      case "cancelled":
        return <ReloadOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  return (
    <div className={getThemeClass("bookingsPage", currentTheme, styles)}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={getThemeClass("headerTitle", currentTheme, styles)}>
            Vessel Bookings
          </h1>
          <p className={getThemeClass("headerSubtitle", currentTheme, styles)}>
            Manage your vessel booking requests and schedules
          </p>
        </div>
        <button
          className={getThemeClass("btnPrimary", currentTheme, styles)}
          onClick={handleCreateBooking}
          aria-label="Create new booking"
        >
          <PlusOutlined style={{ marginRight: "8px" }} />
          New Booking
        </button>
      </div>

      {/* Search and Filters Section */}
      <SearchAndFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        debounceMs={300}
      />

      {/* Results Summary */}
      <div className={styles.resultsSummary}>
        <span className={getThemeClass("resultsCount", currentTheme, styles)}>
          {loading
            ? "Loading..."
            : `${bookings.length} booking${
                bookings.length !== 1 ? "s" : ""
              } found`}
        </span>
        {error && (
          <button
            onClick={refreshBookings}
            className={getThemeClass("btnLink", currentTheme, styles)}
            aria-label="Retry loading bookings"
          >
            <ReloadOutlined style={{ marginRight: "8px" }} />
            Retry
          </button>
        )}
      </div>

      {/* Bookings List */}
      <div className={styles.bookingsListContainer}>
        {error ? (
          <div className={getThemeClass("errorState", currentTheme, styles)}>
            <div className={styles.errorIcon}>
              <ExclamationCircleOutlined
                style={{ fontSize: "48px", color: "#ff4d4f" }}
              />
            </div>
            <h3 className={getThemeClass("errorTitle", currentTheme, styles)}>
              Failed to load bookings
            </h3>
            <p className={getThemeClass("errorMessage", currentTheme, styles)}>
              {error}
            </p>
            <button
              onClick={refreshBookings}
              className={getThemeClass("btnPrimary", currentTheme, styles)}
            >
              <ReloadOutlined style={{ marginRight: "8px" }} />
              Try Again
            </button>
          </div>
        ) : loading ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : bookings.length === 0 ? (
          <div className={getThemeClass("emptyState", currentTheme, styles)}>
            <div className={styles.emptyIcon}>
              <FileTextOutlined
                style={{ fontSize: "48px", color: "#8c8c8c" }}
              />
            </div>
            <h3 className={getThemeClass("emptyTitle", currentTheme, styles)}>
              No bookings found
            </h3>
            <p className={getThemeClass("emptyMessage", currentTheme, styles)}>
              {filters.customerName || filters.status || filters.dateRange.start
                ? "Try adjusting your search filters."
                : "Get started by creating your first booking."}
            </p>
            {!filters.customerName &&
              !filters.status &&
              !filters.dateRange.start && (
                <button
                  onClick={handleCreateBooking}
                  className={getThemeClass("btnPrimary", currentTheme, styles)}
                >
                  <PlusOutlined style={{ marginRight: "8px" }} />
                  Create First Booking
                </button>
              )}
          </div>
        ) : (
          <div className={styles.bookingsTableContainer}>
            <table className={styles.bookingsTable} role="table">
              <thead>
                <tr
                  className={getThemeClass(
                    "tableHeaderRow",
                    currentTheme,
                    styles
                  )}
                >
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                  >
                    Booking ID
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                  >
                    Vessel
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                  >
                    Date Range
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={`${getThemeClass(
                      "bookingRow",
                      currentTheme,
                      styles
                    )} ${
                      booking.status === "cancelled"
                        ? getThemeClass(
                            "bookingRowCancelled",
                            currentTheme,
                            styles
                          )
                        : ""
                    }`}
                    onClick={() => handleBookingClick(booking)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleBookingClick(booking);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for booking ${booking.id}`}
                  >
                    <td
                      className={getThemeClass(
                        "tableCell",
                        currentTheme,
                        styles
                      )}
                    >
                      {booking.id}
                    </td>
                    <td
                      className={getThemeClass(
                        "tableCell",
                        currentTheme,
                        styles
                      )}
                    >
                      {booking.customer}
                    </td>
                    <td
                      className={getThemeClass(
                        "tableCell",
                        currentTheme,
                        styles
                      )}
                    >
                      {booking.vessel}
                    </td>
                    <td
                      className={getThemeClass(
                        "tableCell",
                        currentTheme,
                        styles
                      )}
                    >
                      <span
                        className={getThemeClass(
                          `statusBadge${
                            booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)
                          }`,
                          currentTheme,
                          styles
                        )}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td
                      className={getThemeClass(
                        "tableCell",
                        currentTheme,
                        styles
                      )}
                    >
                      {formatDateRange(booking.startDate, booking.endDate)}
                    </td>
                    <td
                      className={getThemeClass(
                        "tableCell",
                        currentTheme,
                        styles
                      )}
                    >
                      {calculateDuration(booking.startDate, booking.endDate)}{" "}
                      days
                    </td>
                    <td
                      className={getThemeClass(
                        "tableCell",
                        currentTheme,
                        styles
                      )}
                    >
                      <div className={styles.actionButtons}>
                        {/* Status Toggle Button - Always visible */}
                        <button
                          className={
                            booking.status === "pending"
                              ? styles.quickActionBtnSuccess
                              : booking.status === "confirmed"
                              ? styles.quickActionBtnWarning
                              : styles.quickActionBtnRestore
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusToggle(booking.id);
                          }}
                          title={getStatusToggleTooltip(booking.status)}
                          aria-label={`${getStatusToggleTooltip(
                            booking.status
                          )} ${booking.id}`}
                        >
                          {getStatusToggleIcon(booking.status)}
                        </button>

                        {/* Delete Button - Always visible */}
                        <button
                          className={styles.quickActionBtnDanger}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBooking(booking.id);
                          }}
                          title="Delete booking"
                          aria-label={`Delete booking ${booking.id}`}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        updateBookingStatus={updateBookingStatus}
        deleteBooking={deleteBooking}
        onEdit={handleEditBooking}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && bookingToDelete && (
        <div className={getThemeClass("modalOverlay", currentTheme, styles)}>
          <div
            className={getThemeClass("confirmationModal", currentTheme, styles)}
          >
            <div className={styles.confirmationHeader}>
              <h3 className={styles.confirmationTitle}>Confirm Deletion</h3>
            </div>
            <div className={styles.confirmationBody}>
              <p className={styles.confirmationMessage}>
                Are you sure you want to delete booking{" "}
                <strong>{bookingToDelete.id}</strong> for customer{" "}
                <strong>{bookingToDelete.customer}</strong>?
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
                onClick={confirmDeleteBooking}
              >
                <DeleteOutlined style={{ marginRight: "8px" }} />
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <CreateBookingForm
          isOpen={showCreateForm}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          editingBooking={editingBooking}
        />
      )}
    </div>
  );
};

// BookingsPage doesn't accept any props
BookingsPage.propTypes = {};

export default BookingsPage;
