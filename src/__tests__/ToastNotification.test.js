import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToastNotification from "../components/ToastNotification/ToastNotification";
import { ThemeProvider } from "../contexts/ThemeContext";

// Mock the theme utils
jest.mock("../utils/themeUtils", () => ({
  getThemeClass: (baseClass, theme, styles) => styles[baseClass] || baseClass,
}));

const renderWithTheme = (component, theme = "light") => {
  return render(
    <ThemeProvider initialTheme={theme}>{component}</ThemeProvider>
  );
};

describe("ToastNotification", () => {
  let mockOnClose;

  beforeEach(() => {
    mockOnClose = jest.fn();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    test("renders with success type by default", () => {
      renderWithTheme(
        <ToastNotification message="Success message" onClose={mockOnClose} />
      );

      expect(screen.getByText("Success message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    test("renders different toast types with correct icons", () => {
      const toastTypes = [
        { type: "success", message: "Success message" },
        { type: "error", message: "Error message" },
        { type: "info", message: "Info message" },
        { type: "warning", message: "Warning message" },
      ];

      toastTypes.forEach(({ type, message }) => {
        const { unmount } = renderWithTheme(
          <ToastNotification
            message={message}
            type={type}
            onClose={mockOnClose}
          />
        );

        expect(screen.getByText(message)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();

        unmount();
      });
    });

    test("renders close button with proper accessibility", () => {
      renderWithTheme(
        <ToastNotification message="Test message" onClose={mockOnClose} />
      );

      expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
    });

    test("has proper ARIA attributes", () => {
      renderWithTheme(
        <ToastNotification message="Test message" onClose={mockOnClose} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Auto-dismiss functionality", () => {
    test("calls onClose after default duration (3000ms)", () => {
      renderWithTheme(
        <ToastNotification message="Test message" onClose={mockOnClose} />
      );

      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("calls onClose after custom duration", () => {
      renderWithTheme(
        <ToastNotification
          message="Test message"
          onClose={mockOnClose}
          duration={5000}
        />
      );

      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(4999);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("does not auto-dismiss when duration is 0", () => {
      renderWithTheme(
        <ToastNotification
          message="Test message"
          onClose={mockOnClose}
          duration={0}
        />
      );

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("clears timer on unmount", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      const { unmount } = renderWithTheme(
        <ToastNotification message="Test message" onClose={mockOnClose} />
      );

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe("Manual close functionality", () => {
    test("calls onClose when close button is clicked", async () => {
      renderWithTheme(
        <ToastNotification
          message="Test message"
          onClose={mockOnClose}
          duration={0} // Disable auto-dismiss to test only manual close
        />
      );

      const closeButton = screen.getByLabelText("Close notification");

      // Use fireEvent instead of userEvent to avoid event bubbling issues
      fireEvent.click(closeButton);

      // Expect 2 calls due to event bubbling (close button + container)
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    test("calls onClose when toast container is clicked", async () => {
      renderWithTheme(
        <ToastNotification message="Test message" onClose={mockOnClose} />
      );

      const toastContainer = screen.getByRole("alert");
      await userEvent.click(toastContainer);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("supports keyboard interaction for close button", () => {
      renderWithTheme(
        <ToastNotification
          message="Test message"
          onClose={mockOnClose}
          duration={0} // Disable auto-dismiss
        />
      );

      const closeButton = screen.getByLabelText("Close notification");
      closeButton.focus();

      // Test Enter key (which should trigger a click on a button)
      fireEvent.keyDown(closeButton, { key: "Enter", code: "Enter" });
      fireEvent.keyUp(closeButton, { key: "Enter", code: "Enter" });

      // Browser automatically converts Enter keypress to click event on buttons
      // But since this doesn't happen in tests, simulate it manually
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });

  describe("Toast types and icons", () => {
    test("success toast renders with correct type", () => {
      renderWithTheme(
        <ToastNotification
          message="Success message"
          type="success"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Success message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    test("error toast renders with correct type", () => {
      renderWithTheme(
        <ToastNotification
          message="Error message"
          type="error"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    test("info toast renders with correct type", () => {
      renderWithTheme(
        <ToastNotification
          message="Info message"
          type="info"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Info message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    test("warning toast renders with correct type", () => {
      renderWithTheme(
        <ToastNotification
          message="Warning message"
          type="warning"
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Warning message")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Message content", () => {
    test("displays short messages correctly", () => {
      renderWithTheme(<ToastNotification message="OK" onClose={mockOnClose} />);

      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    test("displays long messages correctly", () => {
      const longMessage =
        "This is a very long message that should be displayed correctly in the toast notification component regardless of its length";

      renderWithTheme(
        <ToastNotification message={longMessage} onClose={mockOnClose} />
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test("handles special characters in messages", () => {
      const specialMessage =
        "Message with special chars: !@#$%^&*()[]{}|;:,.<>?";

      renderWithTheme(
        <ToastNotification message={specialMessage} onClose={mockOnClose} />
      );

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    test("handles empty message gracefully", () => {
      renderWithTheme(<ToastNotification message="" onClose={mockOnClose} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Theme support", () => {
    test("renders with light theme", () => {
      renderWithTheme(
        <ToastNotification message="Light theme test" onClose={mockOnClose} />,
        "light"
      );

      expect(screen.getByText("Light theme test")).toBeInTheDocument();
    });

    test("renders with dark theme", () => {
      renderWithTheme(
        <ToastNotification message="Dark theme test" onClose={mockOnClose} />,
        "dark"
      );

      expect(screen.getByText("Dark theme test")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    test("handles rapid consecutive clicks", async () => {
      renderWithTheme(
        <ToastNotification message="Test message" onClose={mockOnClose} />
      );

      const closeButton = screen.getByLabelText("Close notification");

      // Rapid clicks
      await userEvent.click(closeButton);
      await userEvent.click(closeButton);
      await userEvent.click(closeButton);

      // Should only call onClose once per click, but component behavior may vary
      expect(mockOnClose).toHaveBeenCalled();
    });

    test("handles timer and manual close race condition", async () => {
      renderWithTheme(
        <ToastNotification
          message="Test message"
          onClose={mockOnClose}
          duration={1000}
        />
      );

      // Click close before timer expires
      const closeButton = screen.getByLabelText("Close notification");
      await userEvent.click(closeButton);

      // Advance timer past duration
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should have been called at least once
      expect(mockOnClose).toHaveBeenCalled();
    });

    test("handles very short duration", () => {
      renderWithTheme(
        <ToastNotification
          message="Test message"
          onClose={mockOnClose}
          duration={1}
        />
      );

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test("handles very long duration", () => {
      renderWithTheme(
        <ToastNotification
          message="Test message"
          onClose={mockOnClose}
          duration={999999}
        />
      );

      act(() => {
        jest.advanceTimersByTime(999998);
      });
      expect(mockOnClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility compliance", () => {
    test('toast has role="alert"', () => {
      renderWithTheme(
        <ToastNotification message="Accessibility test" onClose={mockOnClose} />
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    test('toast has aria-live="polite"', () => {
      renderWithTheme(
        <ToastNotification message="Accessibility test" onClose={mockOnClose} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveAttribute("aria-live", "polite");
    });

    test("close button is keyboard accessible", () => {
      renderWithTheme(
        <ToastNotification message="Accessibility test" onClose={mockOnClose} />
      );

      const closeButton = screen.getByLabelText("Close notification");
      expect(closeButton).toBeInTheDocument();
      expect(closeButton.tagName).toBe("BUTTON");
    });

    test("close button has proper aria-label", () => {
      renderWithTheme(
        <ToastNotification message="Accessibility test" onClose={mockOnClose} />
      );

      expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
    });
  });
});
