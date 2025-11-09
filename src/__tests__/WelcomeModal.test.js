import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../contexts/ThemeContext";
import WelcomeModal from "../components/WelcomeModal/WelcomeModal";

// Mock the theme utils
jest.mock("../utils/themeUtils", () => ({
  getThemeClass: (baseClass, theme, styles) => styles[baseClass] || baseClass,
}));

const renderWithTheme = (component, theme = "light") => {
  return render(
    <ThemeProvider initialTheme={theme}>{component}</ThemeProvider>
  );
};

describe("WelcomeModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    renderWithTheme(<WelcomeModal {...defaultProps} />);

    expect(
      screen.getByText("Welcome to BRS Booking System")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your comprehensive vessel booking management solution")
    ).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderWithTheme(<WelcomeModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText("Welcome to BRS Booking System")
    ).not.toBeInTheDocument();
  });

  it("displays all feature cards", () => {
    renderWithTheme(<WelcomeModal {...defaultProps} />);

    expect(screen.getByText("Flexible Views")).toBeInTheDocument();
    expect(screen.getByText("Easy Booking Creation")).toBeInTheDocument();
    expect(screen.getByText("Powerful Search & Filters")).toBeInTheDocument();
    expect(screen.getByText("Status Management")).toBeInTheDocument();
    expect(screen.getByText("Complete Booking Control")).toBeInTheDocument();
    expect(screen.getByText("Accessibility First")).toBeInTheDocument();
  });

  it("displays quick tips section", () => {
    renderWithTheme(<WelcomeModal {...defaultProps} />);

    expect(screen.getByText("Quick Tips to Get Started")).toBeInTheDocument();
    expect(screen.getByText(/Use the view toggle buttons/)).toBeInTheDocument();
    expect(screen.getByText(/Click "New Booking"/)).toBeInTheDocument();
    expect(screen.getByText(/Use the search bar/)).toBeInTheDocument();
    expect(screen.getByText(/Filter bookings by status/)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onCloseMock = jest.fn();
    renderWithTheme(<WelcomeModal {...defaultProps} onClose={onCloseMock} />);

    const closeButton = screen.getByLabelText("Close welcome modal");
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Get Started button is clicked", () => {
    const onCloseMock = jest.fn();
    renderWithTheme(<WelcomeModal {...defaultProps} onClose={onCloseMock} />);

    const getStartedButton = screen.getByText("Get Started");
    fireEvent.click(getStartedButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", () => {
    const onCloseMock = jest.fn();
    renderWithTheme(<WelcomeModal {...defaultProps} onClose={onCloseMock} />);

    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", () => {
    const onCloseMock = jest.fn();
    renderWithTheme(<WelcomeModal {...defaultProps} onClose={onCloseMock} />);

    const modalTitle = screen.getByText("Welcome to BRS Booking System");
    fireEvent.click(modalTitle);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onCloseMock = jest.fn();
    renderWithTheme(<WelcomeModal {...defaultProps} onClose={onCloseMock} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("has proper accessibility attributes", () => {
    renderWithTheme(<WelcomeModal {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "welcome-modal-title");
    expect(dialog).toHaveAttribute(
      "aria-describedby",
      "welcome-modal-description"
    );

    expect(
      screen.getByRole("heading", { name: /welcome to brs booking system/i })
    ).toHaveAttribute("id", "welcome-modal-title");
  });

  it("renders in both light and dark themes", () => {
    // Test light theme
    const { rerender } = renderWithTheme(<WelcomeModal {...defaultProps} />);
    expect(
      screen.getByText("Welcome to BRS Booking System")
    ).toBeInTheDocument();

    // Test dark theme
    rerender(
      <ThemeProvider initialTheme="dark">
        <WelcomeModal {...defaultProps} />
      </ThemeProvider>
    );
    expect(
      screen.getByText("Welcome to BRS Booking System")
    ).toBeInTheDocument();
  });
});
