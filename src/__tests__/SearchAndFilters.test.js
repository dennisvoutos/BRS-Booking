import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchAndFilters from "../components/SearchAndFilters/SearchAndFilters";
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

describe("SearchAndFilters", () => {
  let mockOnFiltersChange;
  let mockOnClearFilters;
  let defaultFilters;

  beforeEach(() => {
    mockOnFiltersChange = jest.fn();
    mockOnClearFilters = jest.fn();
    defaultFilters = {
      customerName: "",
      status: "",
      dateRange: { start: "", end: "" },
    };
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    test("renders all filter elements", () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(
        screen.getByPlaceholderText("Search by customer name...")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Date Range")).toBeInTheDocument();
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });

    test("renders with initial filter values", () => {
      const filtersWithValues = {
        customerName: "John Doe",
        status: "confirmed",
        dateRange: { start: "2024-01-01", end: "2024-01-31" },
      };

      renderWithTheme(
        <SearchAndFilters
          filters={filtersWithValues}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      // For select elements, check the selected option differently
      const statusSelect = screen.getByLabelText("Status");
      expect(statusSelect.value).toBe("confirmed");
      expect(screen.getByDisplayValue("2024-01-01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2024-01-31")).toBeInTheDocument();
    });

    test("shows clear search button when search has value", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );
      await userEvent.type(searchInput, "test");

      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });

    test("clear filters button is disabled when no filters are active", () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByText("Clear Filters")).toBeDisabled();
    });

    test("clear filters button is enabled when filters are active", () => {
      const activeFilters = {
        ...defaultFilters,
        customerName: "John",
      };

      renderWithTheme(
        <SearchAndFilters
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(screen.getByText("Clear Filters")).not.toBeDisabled();
    });
  });

  describe("Search Functionality", () => {
    test("calls onFiltersChange with debounced search input", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );
      await userEvent.type(searchInput, "John Doe");

      // Should not call immediately
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

      // Fast-forward past the debounce delay
      jest.advanceTimersByTime(300);

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        customerName: "John Doe",
      });
    });

    test("clears search when clear search button is clicked", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );
      await userEvent.type(searchInput, "test");

      const clearSearchButton = screen.getByLabelText("Clear search");
      await userEvent.click(clearSearchButton);

      expect(searchInput.value).toBe("");
    });

    test("respects custom debounce timing", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          debounceMs={500}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );
      await userEvent.type(searchInput, "test");

      // Should not call after default 300ms
      jest.advanceTimersByTime(300);
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

      // Should call after custom 500ms
      jest.advanceTimersByTime(200);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        customerName: "test",
      });
    });
  });

  describe("Status Filter", () => {
    test("calls onFiltersChange when status is changed", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const statusSelect = screen.getByLabelText("Status");
      await userEvent.selectOptions(statusSelect, "confirmed");

      expect(mockOnFiltersChange).toHaveBeenCalledWith({ status: "confirmed" });
    });

    test("shows all status options", () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const statusSelect = screen.getByLabelText("Status");
      const options = Array.from(statusSelect.options).map(
        (option) => option.text
      );

      expect(options).toEqual([
        "All Statuses",
        "Confirmed",
        "Pending",
        "Cancelled",
      ]);
    });
  });

  describe("Date Range Filter", () => {
    test("calls onFiltersChange when start date is changed", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const startDateInput = screen.getByLabelText("Start date");
      fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        dateRange: { start: "2024-01-01", end: "" },
      });
    });

    test("calls onFiltersChange when end date is changed", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const endDateInput = screen.getByLabelText("End date");
      fireEvent.change(endDateInput, { target: { value: "2024-01-31" } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        dateRange: { start: "", end: "2024-01-31" },
      });
    });

    test("preserves existing date when changing one date", async () => {
      const filtersWithStartDate = {
        ...defaultFilters,
        dateRange: { start: "2024-01-01", end: "" },
      };

      renderWithTheme(
        <SearchAndFilters
          filters={filtersWithStartDate}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const endDateInput = screen.getByLabelText("End date");
      fireEvent.change(endDateInput, { target: { value: "2024-01-31" } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        dateRange: { start: "2024-01-01", end: "2024-01-31" },
      });
    });
  });

  describe("Clear Filters", () => {
    test("calls onClearFilters when clear filters button is clicked", async () => {
      const activeFilters = {
        customerName: "John",
        status: "confirmed",
        dateRange: { start: "2024-01-01", end: "2024-01-31" },
      };

      renderWithTheme(
        <SearchAndFilters
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const clearButton = screen.getByText("Clear Filters");
      await userEvent.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalled();
    });

    test("updates search input when filters are cleared externally", () => {
      const { rerender } = renderWithTheme(
        <SearchAndFilters
          filters={{ ...defaultFilters, customerName: "John" }}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      // Initially should show the search term
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();

      // Simulate external clear (like from useBookings hook)
      rerender(
        <ThemeProvider initialTheme="light">
          <SearchAndFilters
            filters={defaultFilters}
            onFiltersChange={mockOnFiltersChange}
            onClearFilters={mockOnClearFilters}
          />
        </ThemeProvider>
      );

      // Should clear the search input
      expect(
        screen.getByPlaceholderText("Search by customer name...")
      ).toHaveValue("");
    });
  });

  describe("Accessibility", () => {
    test("has proper aria labels for all inputs", () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(
        screen.getByLabelText("Search bookings by customer name")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Date Range")).toBeInTheDocument();
      expect(screen.getByLabelText("Start date")).toBeInTheDocument();
      expect(screen.getByLabelText("End date")).toBeInTheDocument();
      expect(screen.getByLabelText("Clear all filters")).toBeInTheDocument();
    });

    test("clear search button has proper accessibility", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const searchInput = screen.getByLabelText(
        "Search bookings by customer name"
      );
      await userEvent.type(searchInput, "test");

      const clearSearchButton = screen.getByLabelText("Clear search");
      expect(clearSearchButton).toHaveAttribute("type", "button");
    });
  });

  describe("Theme Support", () => {
    test("renders with light theme", () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />,
        "light"
      );

      expect(
        screen.getByLabelText("Search bookings by customer name")
      ).toBeInTheDocument();
    });

    test("renders with dark theme", () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />,
        "dark"
      );

      expect(
        screen.getByLabelText("Search bookings by customer name")
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    test("handles undefined filter values gracefully", () => {
      const incompleteFilters = {
        customerName: undefined,
        status: null,
        dateRange: { start: undefined, end: null },
      };

      renderWithTheme(
        <SearchAndFilters
          filters={incompleteFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      expect(
        screen.getByPlaceholderText("Search by customer name...")
      ).toHaveValue("");
      expect(screen.getByLabelText("Status")).toHaveValue("");
    });

    test("handles rapid filter changes", async () => {
      renderWithTheme(
        <SearchAndFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        "Search by customer name..."
      );
      const statusSelect = screen.getByLabelText("Status");

      // Rapid changes
      await userEvent.type(searchInput, "John");
      await userEvent.selectOptions(statusSelect, "confirmed");

      jest.advanceTimersByTime(300);

      // Should have called with search change
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        customerName: "John",
      });
      // Should have called with status change immediately
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ status: "confirmed" });
    });
  });
});
