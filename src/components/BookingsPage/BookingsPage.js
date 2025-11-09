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
  TableOutlined,
  AppstoreOutlined,
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
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [processingBookingId, setProcessingBookingId] = useState(null); // Track which booking is being processed
  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: null,
  }); // Sorting state

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
    if (processingBookingId !== null) return;

    const booking = bookings.find((b) => b.id === bookingId);
    setBookingToDelete(booking);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    setProcessingBookingId(bookingToDelete.id);

    try {
      const result = await deleteBooking(bookingToDelete.id);
      if (result.success) {
        console.log("Successfully deleted booking:", bookingToDelete.id);
      } else {
        console.error("Failed to delete booking:", result.error);
        showError(`Failed to delete booking: ${result.error}`);
      }
    } finally {
      setProcessingBookingId(null);
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
    }
  };

  const handleStatusToggle = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || processingBookingId !== null) return;

    console.log(`Setting processing state for booking ${bookingId}`);
    setProcessingBookingId(bookingId);

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

    try {
      // Add a small delay to make the disabled state visible
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = await updateBookingStatus(bookingId, newStatus);
      if (result.success) {
        console.log("Successfully updated booking status:", bookingId);
      } else {
        console.error("Failed to update booking status:", result.error);
        showError(`Failed to update booking status: ${result.error}`);
      }
    } finally {
      console.log(`Clearing processing state for booking ${bookingId}`);
      setProcessingBookingId(null);
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

  const handleSort = (column) => {
    let direction = "asc";

    if (sortConfig.column === column) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        // Reset sorting (no sort)
        setSortConfig({ column: null, direction: null });
        return;
      }
    }

    setSortConfig({ column, direction });
  };

  const getSortIcon = (column) => {
    if (sortConfig.column !== column) {
      return null; // No icon when not sorted
    }

    if (sortConfig.direction === "asc") {
      return <span style={{ fontSize: "12px", marginLeft: "4px" }}>↑</span>;
    } else if (sortConfig.direction === "desc") {
      return <span style={{ fontSize: "12px", marginLeft: "4px" }}>↓</span>;
    }

    return null;
  };

  const sortedBookings = React.useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) {
      return bookings;
    }

    return [...bookings].sort((a, b) => {
      let aValue = a[sortConfig.column];
      let bValue = b[sortConfig.column];

      // Handle different data types
      switch (sortConfig.column) {
        case "id":
          // Convert to number for proper sorting
          aValue = parseInt(aValue.replace(/[^\d]/g, ""), 10);
          bValue = parseInt(bValue.replace(/[^\d]/g, ""), 10);
          break;
        case "startDate":
        case "endDate":
          // Convert to Date objects
          aValue = new Date(aValue);
          bValue = new Date(bValue);
          break;
        case "duration":
          // Calculate duration in days for sorting
          const aStart = new Date(a.startDate);
          const aEnd = new Date(a.endDate);
          const bStart = new Date(b.startDate);
          const bEnd = new Date(b.endDate);
          aValue = Math.ceil((aEnd - aStart) / (1000 * 60 * 60 * 24));
          bValue = Math.ceil((bEnd - bStart) / (1000 * 60 * 60 * 24));
          break;
        case "customer":
        case "vessel":
        case "status":
          // String comparison (case insensitive)
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          break;
        default:
          break;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [bookings, sortConfig]);

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
        <div className={styles.headerActions}>
          {/* View Toggle */}
          <div className={styles.viewToggle}>
            <button
              className={`${getThemeClass(
                "btnSecondary",
                currentTheme,
                styles
              )} ${viewMode === "table" ? styles.active : ""}`}
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              title="Table view"
            >
              <TableOutlined />
            </button>
            <button
              className={`${getThemeClass(
                "btnSecondary",
                currentTheme,
                styles
              )} ${viewMode === "card" ? styles.active : ""}`}
              onClick={() => setViewMode("card")}
              aria-label="Card view"
              title="Card view"
            >
              <AppstoreOutlined />
            </button>
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
          <LoadingSkeleton variant={viewMode} rows={5} />
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
        ) : viewMode === "table" ? (
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
                    onClick={() => handleSort("id")}
                    style={{ cursor: "pointer" }}
                  >
                    Booking ID {getSortIcon("id")}
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                    onClick={() => handleSort("customer")}
                    style={{ cursor: "pointer" }}
                  >
                    Customer {getSortIcon("customer")}
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                    onClick={() => handleSort("vessel")}
                    style={{ cursor: "pointer" }}
                  >
                    Vessel {getSortIcon("vessel")}
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                    onClick={() => handleSort("status")}
                    style={{ cursor: "pointer" }}
                  >
                    Status {getSortIcon("status")}
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                    onClick={() => handleSort("startDate")}
                    style={{ cursor: "pointer" }}
                  >
                    Date Range {getSortIcon("startDate")}
                  </th>
                  <th
                    scope="col"
                    className={getThemeClass(
                      "tableHeader",
                      currentTheme,
                      styles
                    )}
                    onClick={() => handleSort("duration")}
                    style={{ cursor: "pointer" }}
                  >
                    Duration {getSortIcon("duration")}
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
                {sortedBookings.map((booking) => (
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
                          disabled={processingBookingId !== null}
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
                          disabled={processingBookingId !== null}
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
        ) : (
          <div className={styles.cardsContainer}>
            {bookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{booking.clientName}</h3>
                  <span
                    className={
                      styles[
                        `statusBadge${
                          booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)
                        }${
                          currentTheme.charAt(0).toUpperCase() +
                          currentTheme.slice(1)
                        }`
                      ]
                    }
                  >
                    {booking.status}
                  </span>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardRow}>
                    <strong>Service:</strong> {booking.service}
                  </div>
                  <div className={styles.cardRow}>
                    <strong>Date:</strong>{" "}
                    {new Date(booking.date).toLocaleDateString()}
                  </div>
                  <div className={styles.cardRow}>
                    <strong>Time:</strong> {booking.time}
                  </div>
                  <div className={styles.cardRow}>
                    <strong>Phone:</strong> {booking.phone}
                  </div>
                  <div className={styles.cardRow}>
                    <strong>Email:</strong> {booking.email}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(booking)}
                    className={`${styles.actionButton} ${
                      styles[
                        `viewDetailsButton${
                          currentTheme.charAt(0).toUpperCase() +
                          currentTheme.slice(1)
                        }`
                      ]
                    }`}
                    disabled={processingBookingId !== null}
                    aria-label={`View details for ${booking.clientName}'s booking`}
                  >
                    View Details
                  </button>

                  <div className={styles.statusActions}>
                    {/* Status Toggle Button - matches table functionality */}
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(booking.id)}
                      className={`${styles.actionButton} ${
                        booking.status === "pending"
                          ? styles.confirmButton
                          : booking.status === "confirmed"
                          ? styles.warningButton
                          : styles.restoreButton
                      }`}
                      disabled={processingBookingId !== null}
                      title={getStatusToggleTooltip(booking.status)}
                      aria-label={`${getStatusToggleTooltip(
                        booking.status
                      )} for ${booking.clientName}'s booking`}
                    >
                      {getStatusToggleIcon(booking.status)}
                      {booking.status === "pending" && " Confirm"}
                      {booking.status === "confirmed" && " Make Pending"}
                      {booking.status === "cancelled" && " Restore"}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBooking(booking.id)}
                      className={`${styles.actionButton} ${
                        styles[
                          `cancelButton${
                            currentTheme.charAt(0).toUpperCase() +
                            currentTheme.slice(1)
                          }`
                        ]
                      }`}
                      disabled={processingBookingId !== null}
                      title="Delete booking"
                      aria-label={`Delete ${booking.clientName}'s booking`}
                    >
                      <DeleteOutlined /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
