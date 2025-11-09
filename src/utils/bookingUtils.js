/**
 * Utility functions for booking management, date formatting, validation,
 * filtering, and status management. Provides comprehensive tools for
 * handling booking-related operations throughout the application.
 */

/**
 * Formats a date string into a human-readable format using Greek locale (DD/MM/YYYY).
 *
 * @param {string} dateString - The date string to format (YYYY-MM-DD format)
 * @returns {string} Formatted date string (e.g., "15/01/2024")
 *
 * @example
 * formatDate('2024-01-15') // Returns "15/01/2024"
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("el-GR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Formats a date string into a human-readable format with Greek month names.
 *
 * @param {string} dateString - The date string to format (YYYY-MM-DD format)
 * @returns {string} Formatted date string (e.g., "15 Ιαν 2024")
 *
 * @example
 * formatDateWithMonthName('2024-01-15') // Returns "15 Ιαν 2024"
 */
export const formatDateWithMonthName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("el-GR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Converts DD/MM/YYYY string to YYYY-MM-DD format for HTML date inputs.
 *
 * @param {string} greekDateString - Date string in DD/MM/YYYY format
 * @returns {string} Date string in YYYY-MM-DD format
 *
 * @example
 * greekToISO('15/01/2024') // Returns "2024-01-15"
 */
export const greekToISO = (greekDateString) => {
  if (!greekDateString || !greekDateString.includes("/")) return "";

  const [day, month, year] = greekDateString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

/**
 * Converts YYYY-MM-DD string to DD/MM/YYYY format for display.
 *
 * @param {string} isoDateString - Date string in YYYY-MM-DD format
 * @returns {string} Date string in DD/MM/YYYY format
 *
 * @example
 * isoToGreek('2024-01-15') // Returns "15/01/2024"
 */
export const isoToGreek = (isoDateString) => {
  if (!isoDateString) return "";

  const [year, month, day] = isoDateString.split("-");
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date range into a readable string representation.
 *
 * @param {string} startDate - The start date string (YYYY-MM-DD format)
 * @param {string} endDate - The end date string (YYYY-MM-DD format)
 * @returns {string} Formatted date range string (e.g., "Jan 15, 2024 - Jan 20, 2024")
 *
 * @example
 * formatDateRange('2024-01-15', '2024-01-20') // Returns "Jan 15, 2024 - Jan 20, 2024"
 */
export const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Calculates the duration between two dates in days.
 *
 * @param {string} startDate - The start date string (YYYY-MM-DD format)
 * @param {string} endDate - The end date string (YYYY-MM-DD format)
 * @returns {number} Duration in days (rounded up to nearest day)
 *
 * @example
 * calculateDuration('2024-01-15', '2024-01-20') // Returns 5
 */
export const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Filters an array of bookings based on multiple search criteria.
 * Supports text search, status filtering, and date range filtering.
 *
 * @param {Array<Object>} bookings - Array of booking objects to filter
 * @param {Object} filters - Filter criteria object
 * @param {string} [filters.customerName] - Customer name to search for (case-insensitive)
 * @param {string} [filters.status] - Status to filter by (exact match)
 * @param {Object} [filters.dateRange] - Date range filter object
 * @param {string} [filters.dateRange.start] - Start date for range filter (YYYY-MM-DD)
 * @param {string} [filters.dateRange.end] - End date for range filter (YYYY-MM-DD)
 * @returns {Array<Object>} Filtered array of bookings
 *
 * @example
 * const filtered = filterBookings(bookings, {
 *   customerName: 'john',
 *   status: 'confirmed',
 *   dateRange: { start: '2024-01-01', end: '2024-12-31' }
 * });
 */
export const filterBookings = (bookings, filters) => {
  const { customerName, status, dateRange } = filters;

  return bookings.filter((booking) => {
    // Filter by customer name
    if (
      customerName &&
      !booking.customer.toLowerCase().includes(customerName.toLowerCase())
    ) {
      return false;
    }

    // Filter by status
    if (status && booking.status !== status) {
      return false;
    }

    // Filter by date range
    if (dateRange && dateRange.start && dateRange.end) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      const filterStart = new Date(dateRange.start);
      const filterEnd = new Date(dateRange.end);

      // Check if booking overlaps with filter date range
      if (bookingEnd < filterStart || bookingStart > filterEnd) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Validates booking form data and returns validation errors.
 * Checks for required fields, date logic, and data format constraints.
 *
 * @param {Object} formData - The form data object to validate
 * @param {string} formData.customer - Customer name field
 * @param {string} formData.vessel - Vessel name field
 * @param {string} formData.status - Booking status field
 * @param {string} formData.startDate - Start date field (YYYY-MM-DD)
 * @param {string} formData.endDate - End date field (YYYY-MM-DD)
 * @returns {Object} Object containing validation errors (empty if valid)
 *
 * @example
 * const errors = validateBookingForm({
 *   customer: 'John Doe',
 *   vessel: 'Ocean Explorer',
 *   status: 'pending',
 *   startDate: '2024-01-15',
 *   endDate: '2024-01-10' // Invalid: before start date
 * });
 * // Returns: { endDate: 'End date must be after start date' }
 */
export const validateBookingForm = (formData) => {
  const errors = {};

  if (!formData.customer?.trim()) {
    errors.customer = "Customer name is required";
  }

  if (!formData.vessel?.trim()) {
    errors.vessel = "Vessel name is required";
  }

  if (!formData.startDate) {
    errors.startDate = "Start date is required";
  }

  if (!formData.endDate) {
    errors.endDate = "End date is required";
  }

  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start >= end) {
      errors.endDate = "End date must be after start date";
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      errors.startDate = "Start date cannot be in the past";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Returns the appropriate text color for a given booking status.
 * Used for consistent status styling throughout the application.
 *
 * @param {string} status - The booking status ('confirmed', 'pending', 'cancelled')
 * @returns {string} Hex color code for the status text
 *
 * @example
 * getStatusColor('confirmed') // Returns '#52c41a' (green)
 * getStatusColor('pending') // Returns '#faad14' (yellow)
 * getStatusColor('cancelled') // Returns '#ff4d4f' (red)
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "#10b981"; // green
    case "pending":
      return "#f59e0b"; // amber
    case "cancelled":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

/**
 * Returns the appropriate background color for a given booking status.
 * Used for status badges and highlights throughout the application.
 *
 * @param {string} status - The booking status ('confirmed', 'pending', 'cancelled')
 * @returns {string} Hex color code for the status background
 *
 * @example
 * getStatusBgColor('confirmed') // Returns '#ecfdf5' (light green)
 * getStatusBgColor('pending') // Returns '#fffbeb' (light yellow)
 * getStatusBgColor('cancelled') // Returns '#fef2f2' (light red)
 */
export const getStatusBgColor = (status) => {
  switch (status) {
    case "confirmed":
      return "#d1fae5"; // light green
    case "pending":
      return "#fef3c7"; // light amber
    case "cancelled":
      return "#fee2e2"; // light red
    default:
      return "#f3f4f6"; // light gray
  }
};
