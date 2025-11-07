import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingDetailModal from "../components/BookingDetailModal/BookingDetailModal";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";

// Mock the theme utils
jest.mock("../utils/themeUtils", () => ({
  getThemeClass: (baseClass, theme, styles) => styles[baseClass] || baseClass,
}));

// Mock the booking utils
jest.mock("../utils/bookingUtils", () => ({
  formatDateRange: (start, end) => `${start} - ${end}`,
  calculateDuration: (start, end) => 7,
  getStatusColor: (status) => (status === "confirmed" ? "#52c41a" : "#ff4d4f"),
  getStatusBgColor: (status) =>
    status === "confirmed" ? "#f6ffed" : "#fff2f0",
}));

// Mock the accessibility utils
jest.mock("../utils/accessibility", () => ({
  trapFocus: jest.fn(() => jest.fn()),
  liveRegionManager: {
    announce: jest.fn(),
  },
}));

const renderWithProviders = (component, theme = "light") => {
  return render(
    <ThemeProvider initialTheme={theme}>
      <ToastProvider>{component}</ToastProvider>
    </ThemeProvider>
  );
};

const mockBooking = {
  id: "BOOK-001",
  customer: "John Doe",
  vessel: "Ocean Explorer",
  status: "confirmed",
  startDate: "2024-01-15",
  endDate: "2024-01-22",
  port: "Miami",
  purpose: "Leisure",
  guests: 6,
  specialRequests: "Dietary restrictions for guest allergies",
};

describe("BookingDetailModal", () => {
  let mockOnClose;
  let mockUpdateBookingStatus;
  let mockDeleteBooking;
  let mockOnEdit;

  beforeEach(() => {
    mockOnClose = jest.fn();
    mockUpdateBookingStatus = jest.fn().mockResolvedValue({ success: true });
    mockDeleteBooking = jest.fn().mockResolvedValue({ success: true });
    mockOnEdit = jest.fn();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Mock document.body.style for overflow management
    Object.defineProperty(document.body, "style", {
      writable: true,
      value: { overflow: "" },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Modal Display", () => {
    test("does not render when isOpen is false", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={false}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.queryByText("Booking Details")).not.toBeInTheDocument();
    });

    test("does not render when booking is null", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={null}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.queryByText("Booking Details")).not.toBeInTheDocument();
    });

    test("renders when isOpen is true and booking exists", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText("Booking Details")).toBeInTheDocument();
      expect(screen.getAllByText("BOOK-001")).toHaveLength(2); // ID appears in badge and summary
    });

    test("displays booking information correctly", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getAllByText("John Doe")).toHaveLength(2); // Appears in detail and summary
      expect(screen.getAllByText("Ocean Explorer")).toHaveLength(2); // Appears in detail and summary
      expect(screen.getAllByText("Confirmed")).toHaveLength(2); // Appears in large and small status badges
      expect(screen.getAllByText("BOOK-001")).toHaveLength(2); // Appears in badge and summary
      expect(screen.getAllByText("7 days")).toHaveLength(2); // Duration appears in detail and summary
    });

    test("has proper accessibility attributes", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");

      expect(
        screen.getByRole("heading", { name: "Booking Details" })
      ).toHaveAttribute("id", "modal-title");
    });
  });

  describe("Modal Close Functionality", () => {
    test("calls onClose when close button is clicked", async () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const closeButton = screen.getByLabelText("Close booking details");
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when overlay is clicked", async () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const overlay = screen.getByRole("dialog");
      await userEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when Escape key is pressed", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("does not close when clicking on modal content", async () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const modalContent = screen.getByText("Booking Details");
      await userEvent.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Edit Functionality", () => {
    test("calls onEdit when edit button is clicked", async () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByText("Edit Booking");
      await userEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockBooking);
    });

    test("edit button is always available regardless of status", () => {
      const statuses = ["pending", "confirmed", "cancelled"];

      statuses.forEach((status) => {
        const bookingWithStatus = { ...mockBooking, status };

        const { unmount } = renderWithProviders(
          <BookingDetailModal
            booking={bookingWithStatus}
            isOpen={true}
            onClose={mockOnClose}
            updateBookingStatus={mockUpdateBookingStatus}
            deleteBooking={mockDeleteBooking}
            onEdit={mockOnEdit}
          />
        );

        expect(screen.getByText("Edit Booking")).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("Status Change Actions", () => {
    test("shows confirm button for pending bookings", () => {
      const pendingBooking = { ...mockBooking, status: "pending" };

      renderWithProviders(
        <BookingDetailModal
          booking={pendingBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText("Confirm Booking")).toBeInTheDocument();
    });

    test("shows make pending button for confirmed bookings", () => {
      const confirmedBooking = { ...mockBooking, status: "confirmed" };

      renderWithProviders(
        <BookingDetailModal
          booking={confirmedBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText("Make Pending")).toBeInTheDocument();
    });

    test("shows restore button for cancelled bookings", () => {
      const cancelledBooking = { ...mockBooking, status: "cancelled" };

      renderWithProviders(
        <BookingDetailModal
          booking={cancelledBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText("Restore to Pending")).toBeInTheDocument();
    });

    test("shows cancel button for non-cancelled bookings", () => {
      const nonCancelledStatuses = ["pending", "confirmed"];

      nonCancelledStatuses.forEach((status) => {
        const bookingWithStatus = { ...mockBooking, status };

        const { unmount } = renderWithProviders(
          <BookingDetailModal
            booking={bookingWithStatus}
            isOpen={true}
            onClose={mockOnClose}
            updateBookingStatus={mockUpdateBookingStatus}
            deleteBooking={mockDeleteBooking}
            onEdit={mockOnEdit}
          />
        );

        expect(screen.getByText("Cancel Booking")).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("API Simulation and Loading States", () => {
    test("shows loading state when confirming booking", async () => {
      const pendingBooking = { ...mockBooking, status: "pending" };

      renderWithProviders(
        <BookingDetailModal
          booking={pendingBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const confirmButton = screen.getByText("Confirm Booking");
      await userEvent.click(confirmButton);

      expect(screen.getByText("Confirming...")).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();
    });

    test("calls updateBookingStatus with correct parameters when confirming", async () => {
      const pendingBooking = { ...mockBooking, status: "pending" };

      renderWithProviders(
        <BookingDetailModal
          booking={pendingBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const confirmButton = screen.getByText("Confirm Booking");
      await userEvent.click(confirmButton);

      // Wait for the simulated API delay
      await waitFor(
        () => {
          expect(mockUpdateBookingStatus).toHaveBeenCalledWith(
            "BOOK-001",
            "confirmed"
          );
        },
        { timeout: 3000 }
      );
    });

    test("closes modal after successful API call", async () => {
      const pendingBooking = { ...mockBooking, status: "pending" };

      renderWithProviders(
        <BookingDetailModal
          booking={pendingBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const confirmButton = screen.getByText("Confirm Booking");
      await userEvent.click(confirmButton);

      // Fast-forward through the API simulation
      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test("handles API failure gracefully", async () => {
      const failingUpdateBookingStatus = jest.fn().mockResolvedValue({
        success: false,
        error: "Network error",
      });

      const pendingBooking = { ...mockBooking, status: "pending" };

      renderWithProviders(
        <BookingDetailModal
          booking={pendingBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={failingUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const confirmButton = screen.getByText("Confirm Booking");
      await userEvent.click(confirmButton);

      // Fast-forward through the API simulation
      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(failingUpdateBookingStatus).toHaveBeenCalled();
      });

      // Modal should remain open on failure
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Delete Confirmation Modal", () => {
    test("shows delete confirmation modal when delete button is clicked", async () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const deleteButton = screen.getByText("Delete Booking");
      await userEvent.click(deleteButton);

      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to permanently delete booking/)
      ).toBeInTheDocument();
    });

    test("cancels deletion when cancel button is clicked", async () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      // Open delete confirmation
      const deleteButton = screen.getByText("Delete Booking");
      await userEvent.click(deleteButton);

      // Cancel deletion
      const cancelButton = screen.getByText("Cancel");
      await userEvent.click(cancelButton);

      expect(screen.queryByText("Confirm Deletion")).not.toBeInTheDocument();
      expect(mockDeleteBooking).not.toHaveBeenCalled();
    });

    test("calls deleteBooking when confirmed", async () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      // Open delete confirmation
      const deleteButton = screen.getByText("Delete Booking");
      await userEvent.click(deleteButton);

      // Confirm deletion
      const confirmDeleteButton = screen.getAllByText("Delete Booking")[1]; // Second one is in confirmation modal
      await userEvent.click(confirmDeleteButton);

      await waitFor(
        () => {
          expect(mockDeleteBooking).toHaveBeenCalledWith("BOOK-001");
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Theme Support", () => {
    test("renders correctly with light theme", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />,
        "light"
      );

      expect(screen.getByText("Booking Details")).toBeInTheDocument();
    });

    test("renders correctly with dark theme", () => {
      renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />,
        "dark"
      );

      expect(screen.getByText("Booking Details")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("manages body overflow when modal opens/closes", () => {
      const { unmount } = renderWithProviders(
        <BookingDetailModal
          booking={mockBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("unset");
    });

    test("disables buttons when loading", async () => {
      const pendingBooking = { ...mockBooking, status: "pending" };

      renderWithProviders(
        <BookingDetailModal
          booking={pendingBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      const confirmButton = screen.getByText("Confirm Booking");
      await userEvent.click(confirmButton);

      // All buttons should be disabled during loading
      expect(screen.getByText("Edit Booking")).toBeDisabled();
      expect(screen.getByLabelText("Close booking details")).toBeDisabled();
    });

    test("prevents closing during loading operations", () => {
      const pendingBooking = { ...mockBooking, status: "pending" };

      renderWithProviders(
        <BookingDetailModal
          booking={pendingBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      // Start a loading operation
      const confirmButton = screen.getByText("Confirm Booking");
      fireEvent.click(confirmButton);

      // Try to close with escape key during loading
      fireEvent.keyDown(document, { key: "Escape" });

      // Should not close during loading
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    test("handles missing booking properties gracefully", () => {
      const incompleteBooking = {
        id: "BOOK-002",
        customer: "Jane Smith",
        status: "pending",
        // Missing other properties
      };

      renderWithProviders(
        <BookingDetailModal
          booking={incompleteBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText("Booking Details")).toBeInTheDocument();
      expect(screen.getAllByText("Jane Smith")).toHaveLength(2); // Appears in detail and summary
    });

    test("handles very long booking data", () => {
      const longBooking = {
        ...mockBooking,
        customer:
          "This is a very long customer name that might cause layout issues if not handled properly",
        vessel:
          "This is a very long vessel name with special characters @#$%^&*()",
        specialRequests:
          "This is an extremely long special request that goes on and on and contains lots of detailed information about dietary restrictions, accessibility needs, and other special accommodations that the customer has requested for their upcoming voyage",
      };

      renderWithProviders(
        <BookingDetailModal
          booking={longBooking}
          isOpen={true}
          onClose={mockOnClose}
          updateBookingStatus={mockUpdateBookingStatus}
          deleteBooking={mockDeleteBooking}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByText("Booking Details")).toBeInTheDocument();
    });
  });
});
