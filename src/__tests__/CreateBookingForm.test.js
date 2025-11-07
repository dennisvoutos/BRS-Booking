import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateBookingForm from "../components/CreateBookingForm/CreateBookingForm";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";

// Helper function to render components with ThemeProvider and ToastProvider
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      <ToastProvider>{component}</ToastProvider>
    </ThemeProvider>
  );
};

describe("CreateBookingForm", () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Validation", () => {
    test("displays validation errors for empty required fields", async () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Try to submit empty form
      const submitButton = screen.getByText("Create Booking");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Customer name is required")
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Vessel name is required")).toBeInTheDocument();
      expect(screen.getByText("Start date is required")).toBeInTheDocument();
      expect(screen.getByText("End date is required")).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("validates that end date is after start date", async () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/customer name/i), {
        target: { value: "Test Customer" },
      });
      fireEvent.change(screen.getByLabelText(/vessel name/i), {
        target: { value: "Test Vessel" },
      });

      // Set end date before start date
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: "2026-02-10" } });
      fireEvent.change(endDateInput, { target: { value: "2026-02-05" } });

      const submitButton = screen.getByText("Create Booking");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("End date must be after start date")
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("validates that start date is not in the past", async () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/customer name/i), {
        target: { value: "Test Customer" },
      });
      fireEvent.change(screen.getByLabelText(/vessel name/i), {
        target: { value: "Test Vessel" },
      });

      // Set past date
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: "2020-01-01" } });
      fireEvent.change(endDateInput, { target: { value: "2020-01-05" } });

      const submitButton = screen.getByText("Create Booking");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Start date cannot be in the past")
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("clears field errors when user starts typing", async () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Submit to show errors
      const submitButton = screen.getByText("Create Booking");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Customer name is required")
        ).toBeInTheDocument();
      });

      // Type in customer field
      const customerInput = screen.getByLabelText(/customer name/i);
      fireEvent.change(customerInput, { target: { value: "Test" } });

      // Error should disappear
      expect(
        screen.queryByText("Customer name is required")
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    test("submits valid form data successfully", async () => {
      const mockBooking = { id: "BK-1007", customer: "Test Customer" };
      mockOnSubmit.mockResolvedValue({ success: true, booking: mockBooking });

      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill valid form data
      fireEvent.change(screen.getByLabelText(/customer name/i), {
        target: { value: "Test Customer" },
      });
      fireEvent.change(screen.getByLabelText(/vessel name/i), {
        target: { value: "Test Vessel" },
      });
      fireEvent.change(screen.getByLabelText(/status/i), {
        target: { value: "confirmed" },
      });
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: "2026-02-10" },
      });
      fireEvent.change(screen.getByLabelText(/end date/i), {
        target: { value: "2026-02-15" },
      });

      const submitButton = screen.getByText("Create Booking");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          customer: "Test Customer",
          vessel: "Test Vessel",
          status: "confirmed",
          startDate: "2026-02-10",
          endDate: "2026-02-15",
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText("Booking created successfully!")
        ).toBeInTheDocument();
      });
    });

    test("handles submission errors gracefully", async () => {
      mockOnSubmit.mockResolvedValue({
        success: false,
        error: "Network error",
      });

      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill valid form data
      fireEvent.change(screen.getByLabelText(/customer name/i), {
        target: { value: "Test Customer" },
      });
      fireEvent.change(screen.getByLabelText(/vessel name/i), {
        target: { value: "Test Vessel" },
      });
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: "2026-02-10" },
      });
      fireEvent.change(screen.getByLabelText(/end date/i), {
        target: { value: "2026-02-15" },
      });

      const submitButton = screen.getByText("Create Booking");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Error: Network error")).toBeInTheDocument();
      });
    });
  });

  describe("Modal Behavior", () => {
    test("closes modal when close button is clicked", async () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const closeButton = screen.getByLabelText("Close create booking form");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("closes modal when cancel button is clicked", async () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("does not render when isOpen is false", () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByText("Create New Booking")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("has proper form labels and structure", () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Check that all form fields have proper labels
      expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vessel name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();

      // Check modal accessibility attributes
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    test("announces validation errors to screen readers", async () => {
      renderWithTheme(
        <CreateBookingForm
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      // Submit to trigger validation errors
      const submitButton = screen.getByText("Create Booking");
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByRole("alert");
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });
});
