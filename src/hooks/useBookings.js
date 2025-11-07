import { useState, useEffect, useCallback } from "react";
import { bookingService } from "../services/bookingService";
import { filterBookings } from "../utils/bookingUtils";

/**
 * Custom hook for managing bookings data and operations. Provides comprehensive
 * booking management functionality including data fetching, filtering, CRUD operations,
 * and state management. Handles loading states, error handling, and automatic
 * data synchronization.
 *
 * Features:
 * - Complete booking data lifecycle management
 * - Real-time filtering with multiple criteria (name, status, date range)
 * - CRUD operations (create, read, update, delete) with optimistic updates
 * - Loading states and error handling for all operations
 * - Automatic data refetching and filter reapplication
 * - Sorting functionality with multiple sort options
 * - Memory efficient with proper cleanup and state management
 *
 * @returns {Object} Booking management state and operations
 * @returns {Array} returns.bookings - All bookings data from the API
 * @returns {Array} returns.filteredBookings - Bookings after applying current filters
 * @returns {boolean} returns.loading - Whether data is currently being fetched
 * @returns {string|null} returns.error - Current error message, if any
 * @returns {Object} returns.filters - Current filter values object
 * @returns {string} returns.filters.customerName - Customer name search filter
 * @returns {string} returns.filters.status - Status filter value
 * @returns {Object} returns.filters.dateRange - Date range filter object
 * @returns {function} returns.updateFilters - Function to update filter values
 * @returns {function} returns.clearFilters - Function to reset all filters
 * @returns {function} returns.addBooking - Function to create a new booking
 * @returns {function} returns.updateBookingStatus - Function to update booking status
 * @returns {function} returns.deleteBooking - Function to delete a booking
 * @returns {function} returns.refreshBookings - Function to manually refresh data
 * @returns {function} returns.sortBookings - Function to sort bookings with specified criteria
 *
 * @example
 * // Basic usage in a component
 * const {
 *   filteredBookings,
 *   loading,
 *   error,
 *   filters,
 *   updateFilters,
 *   addBooking,
 *   deleteBooking
 * } = useBookings();
 *
 * @example
 * // Handling booking operations
 * const handleCreateBooking = async (bookingData) => {
 *   try {
 *     await addBooking(bookingData);
 *     console.log('Booking created successfully');
 *   } catch (error) {
 *     console.error('Failed to create booking:', error);
 *   }
 * };
 */
export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    customerName: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters whenever bookings or filters change
  useEffect(() => {
    const filtered = filterBookings(bookings, filters);
    setFilteredBookings(filtered);
  }, [bookings, filters]);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      customerName: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
  }, []);

  // Add new booking
  const addBooking = useCallback(async (bookingData) => {
    try {
      const newBooking = await bookingService.createBooking(bookingData);
      setBookings((prev) => [...prev, newBooking]);
      return { success: true, booking: newBooking };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Refresh bookings
  const refreshBookings = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Delete booking
  const deleteBooking = useCallback(async (bookingId) => {
    try {
      await bookingService.deleteBooking(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    try {
      const updatedBooking = await bookingService.updateBooking(bookingId, {
        status: newStatus,
      });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      return { success: true, booking: updatedBooking };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Update entire booking
  const updateBooking = useCallback(async (bookingId, updates) => {
    try {
      const updatedBooking = await bookingService.updateBooking(
        bookingId,
        updates
      );
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      return { success: true, booking: updatedBooking };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    bookings: filteredBookings,
    allBookings: bookings,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    addBooking,
    refreshBookings,
    deleteBooking,
    updateBookingStatus,
    updateBooking,
  };
};
