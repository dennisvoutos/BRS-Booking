import { mockBookings } from "../data/mockBookings";

// Simulate network delay
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate API errors occasionally
const shouldSimulateError = () => Math.random() < 0.05; // 5% chance of error

// Local storage for persisting new bookings
const BOOKINGS_STORAGE_KEY = "bookings_data";

// Get bookings from localStorage or use mock data
const getStoredBookings = () => {
  try {
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Error reading bookings from localStorage:", error);
  }
  return mockBookings;
};

// Save bookings to localStorage
const saveBookings = (bookings) => {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.warn("Error saving bookings to localStorage:", error);
  }
};

// Mock API service
export const bookingService = {
  // Fetch all bookings
  async getBookings() {
    await delay();

    if (shouldSimulateError()) {
      throw new Error("Failed to fetch bookings. Please try again.");
    }

    return getStoredBookings();
  },

  // Create a new booking
  async createBooking(bookingData) {
    await delay(1200); // Slightly longer delay for create operation

    if (shouldSimulateError()) {
      throw new Error("Failed to create booking. Please try again.");
    }

    const currentBookings = getStoredBookings();

    // Generate new booking ID
    const maxId = currentBookings.reduce((max, booking) => {
      const num = parseInt(booking.id.split("-")[1]);
      return num > max ? num : max;
    }, 1000);

    const newBooking = {
      id: `BK-${maxId + 1}`,
      ...bookingData,
      status: bookingData.status || "pending",
    };

    const updatedBookings = [...currentBookings, newBooking];
    saveBookings(updatedBookings);

    return newBooking;
  },

  // Update a booking (for future use)
  async updateBooking(id, updates) {
    await delay();

    if (shouldSimulateError()) {
      throw new Error("Failed to update booking. Please try again.");
    }

    const currentBookings = getStoredBookings();
    const bookingIndex = currentBookings.findIndex(
      (booking) => booking.id === id
    );

    if (bookingIndex === -1) {
      throw new Error("Booking not found");
    }

    const updatedBooking = { ...currentBookings[bookingIndex], ...updates };
    const updatedBookings = [...currentBookings];
    updatedBookings[bookingIndex] = updatedBooking;

    saveBookings(updatedBookings);

    return updatedBooking;
  },

  // Cancel a booking
  async cancelBooking(id) {
    return this.updateBooking(id, { status: "cancelled" });
  },

  // Uncancel a booking (restore to pending status)
  async uncancelBooking(id) {
    return this.updateBooking(id, { status: "pending" });
  },

  // Confirm a booking
  async confirmBooking(id) {
    return this.updateBooking(id, { status: "confirmed" });
  },

  // Delete a booking (for future use)
  async deleteBooking(id) {
    await delay();

    if (shouldSimulateError()) {
      throw new Error("Failed to delete booking. Please try again.");
    }

    const currentBookings = getStoredBookings();
    const updatedBookings = currentBookings.filter(
      (booking) => booking.id !== id
    );

    if (updatedBookings.length === currentBookings.length) {
      throw new Error("Booking not found");
    }

    saveBookings(updatedBookings);

    return { success: true };
  },
};
