import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookingsPage from "../components/BookingsPage/BookingsPage";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";
import { bookingService } from "../services/bookingService";

// Mock the bookingService to control the data in tests
jest.mock("../services/bookingService", () => ({
  bookingService: {
    getBookings: jest.fn(),
    createBooking: jest.fn(),
  },
}));

// Helper function to render components with ThemeProvider and ToastProvider
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      <ToastProvider>{component}</ToastProvider>
    </ThemeProvider>
  );
};

const mockBookings = [
  {
    id: "BK-1001",
    customer: "Acme Wind",
    vessel: "Nordic Star",
    status: "confirmed",
    startDate: "2026-01-10",
    endDate: "2026-01-22",
  },
  {
    id: "BK-1002",
    customer: "BlueWave",
    vessel: "Sea Finch",
    status: "pending",
    startDate: "2026-02-03",
    endDate: "2026-02-05",
  },
  {
    id: "BK-1003",
    customer: "Oceanix",
    vessel: "Asteria",
    status: "cancelled",
    startDate: "2026-01-28",
    endDate: "2026-01-31",
  },
];

describe("BookingsPage", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    bookingService.getBookings.mockResolvedValue(mockBookings);
  });

  describe("Search and Filter Functionality", () => {
    test("displays all bookings initially", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      expect(screen.getByText("BlueWave")).toBeInTheDocument();
      expect(screen.getByText("Oceanix")).toBeInTheDocument();
      expect(screen.getByText("3 bookings found")).toBeInTheDocument();
    });

    test("filters bookings by customer name search", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Search for "Acme"
      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );

      // Type in search input and wait for debounce
      fireEvent.change(searchInput, { target: { value: "Acme" } });

      // Wait for search results to filter
      await waitFor(() => {
        expect(screen.getByText("1 booking found")).toBeInTheDocument();
      });

      // Verify the correct booking is shown
      expect(screen.getByText("Acme Wind")).toBeInTheDocument();
    });

    test("filters bookings by status", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Filter by "pending" status
      const statusFilter = screen.getByLabelText("Status");
      fireEvent.change(statusFilter, { target: { value: "pending" } });

      await waitFor(() => {
        expect(screen.getByText("BlueWave")).toBeInTheDocument();
      });

      expect(screen.queryByText("Acme Wind")).not.toBeInTheDocument();
      expect(screen.queryByText("Oceanix")).not.toBeInTheDocument();
      expect(screen.getByText("1 booking found")).toBeInTheDocument();
    });

    test("clears filters when Clear Filters button is clicked", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Apply a search filter
      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );
      fireEvent.change(searchInput, { target: { value: "Acme" } });

      await waitFor(() => {
        expect(screen.getByText("1 booking found")).toBeInTheDocument();
      });

      // Clear filters
      const clearButton = screen.getByText("Clear Filters");
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText("3 bookings found")).toBeInTheDocument();
      });

      expect(searchInput.value).toBe("");
    });

    test("shows empty state when no bookings match filters", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );
      fireEvent.change(searchInput, {
        target: { value: "NonexistentCustomer" },
      });

      await waitFor(() => {
        expect(screen.getByText("No bookings found")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Try adjusting your search filters.")
      ).toBeInTheDocument();
      expect(screen.getByText("0 bookings found")).toBeInTheDocument();
    });
  });

  describe("Loading and Error States", () => {
    test("shows loading state while fetching data", async () => {
      // Make the API call take time to resolve
      bookingService.getBookings.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockBookings), 100))
      );

      renderWithTheme(<BookingsPage />);

      // Check for loading state (now shows skeleton loader)
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText("3 bookings found")).toBeInTheDocument();
      });
    });

    test("shows error state when API fails", async () => {
      bookingService.getBookings.mockRejectedValue(new Error("Network error"));

      renderWithTheme(<BookingsPage />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load bookings")).toBeInTheDocument();
      });

      expect(screen.getByText("Network error")).toBeInTheDocument();

      // Test retry functionality
      bookingService.getBookings.mockResolvedValue(mockBookings);
      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText("3 bookings found")).toBeInTheDocument();
      });
    });

    test("shows empty state when no bookings exist", async () => {
      bookingService.getBookings.mockResolvedValue([]);

      renderWithTheme(<BookingsPage />);

      await waitFor(() => {
        expect(screen.getByText("No bookings found")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Get started by creating your first booking.")
      ).toBeInTheDocument();
      expect(screen.getByText("Create First Booking")).toBeInTheDocument();
      expect(screen.getByText("0 bookings found")).toBeInTheDocument();
    });
  });

  describe("Booking Interaction", () => {
    test("opens booking detail modal when booking row is clicked", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Click on a booking row (find by test attribute or role)
      const bookingRows = screen.getAllByRole("button");
      const acmeRow = bookingRows.find((row) =>
        row.textContent.includes("Acme Wind")
      );
      fireEvent.click(acmeRow);

      await waitFor(() => {
        expect(screen.getByText("Booking Details")).toBeInTheDocument();
      });

      // Check that the modal content includes the booking ID
      expect(screen.getAllByText("BK-1001").length).toBeGreaterThan(0);
    });

    test("opens create booking form when New Booking button is clicked", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Click New Booking button
      const newBookingButton = screen.getByText("New Booking");
      fireEvent.click(newBookingButton);

      await waitFor(() => {
        expect(screen.getByText("Create New Booking")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    test("has proper ARIA labels and roles", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Check for important accessibility attributes
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Search bookings by customer name")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Create new booking")).toBeInTheDocument();
    });

    test("supports keyboard navigation on booking rows", async () => {
      renderWithTheme(<BookingsPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Acme Wind")).toBeInTheDocument();
      });

      // Find booking row and simulate Enter key
      const bookingRows = screen.getAllByRole("button");
      const acmeRow = bookingRows.find((row) =>
        row.textContent.includes("Acme Wind")
      );

      // Simulate Enter key press
      fireEvent.keyDown(acmeRow, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByText("Booking Details")).toBeInTheDocument();
      });
    });
  });
});
