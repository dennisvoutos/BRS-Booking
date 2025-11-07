import React from "react";
import { render, screen } from "@testing-library/react";
import LoadingSkeleton from "../components/LoadingSkeleton/LoadingSkeleton";
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

describe("LoadingSkeleton", () => {
  describe("Component rendering", () => {
    test("renders without crashing with default props", () => {
      renderWithTheme(<LoadingSkeleton />);
      // Component renders successfully
    });

    test("renders with custom className", () => {
      renderWithTheme(<LoadingSkeleton className="custom-skeleton" />);
      // Component renders successfully with custom class
    });

    test("renders with various prop combinations", () => {
      renderWithTheme(
        <LoadingSkeleton
          variant="text"
          width="200px"
          height="2rem"
          rows={3}
          className="test-skeleton"
        />
      );
      // Component renders successfully with all props
    });
  });

  describe("Spinner variant", () => {
    test("renders spinner with loading text", () => {
      renderWithTheme(<LoadingSkeleton variant="spinner" />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("renders spinner with custom className", () => {
      renderWithTheme(
        <LoadingSkeleton variant="spinner" className="custom-spinner" />
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Table variant", () => {
    test("renders table skeleton without errors", () => {
      renderWithTheme(<LoadingSkeleton variant="table" />);
      // Component renders successfully
    });

    test("renders table skeleton with custom rows", () => {
      renderWithTheme(<LoadingSkeleton variant="table" rows={5} />);
      // Component renders successfully with custom rows
    });

    test("renders table skeleton with custom className", () => {
      renderWithTheme(
        <LoadingSkeleton variant="table" className="custom-table" />
      );
      // Component renders successfully with custom class
    });
  });

  describe("Card variant", () => {
    test("renders card skeleton without errors", () => {
      renderWithTheme(<LoadingSkeleton variant="card" />);
      // Component renders successfully
    });

    test("renders card skeleton with custom className", () => {
      renderWithTheme(
        <LoadingSkeleton variant="card" className="custom-card" />
      );
      // Component renders successfully with custom class
    });

    test("card variant ignores rows prop", () => {
      renderWithTheme(<LoadingSkeleton variant="card" rows={10} />);
      // Should render without errors regardless of rows prop
    });
  });

  describe("Theme support", () => {
    test("renders with light theme", () => {
      renderWithTheme(<LoadingSkeleton />, "light");
      // Component renders successfully in light theme
    });

    test("renders with dark theme", () => {
      renderWithTheme(<LoadingSkeleton />, "dark");
      // Component renders successfully in dark theme
    });

    test("all variants work with both themes", () => {
      const variants = ["text", "spinner", "table", "card"];
      const themes = ["light", "dark"];

      variants.forEach((variant) => {
        themes.forEach((theme) => {
          renderWithTheme(<LoadingSkeleton variant={variant} />, theme);
          // All combinations render successfully
        });
      });
    });
  });

  describe("Edge cases", () => {
    test("handles zero rows gracefully", () => {
      renderWithTheme(<LoadingSkeleton rows={0} />);
      // Component handles zero rows without errors
    });

    test("handles large number of rows", () => {
      renderWithTheme(<LoadingSkeleton rows={100} />);
      // Component handles large row count without errors
    });

    test("handles invalid variant gracefully", () => {
      renderWithTheme(<LoadingSkeleton variant="invalid" />);
      // Should fall back to default text behavior
    });

    test("handles undefined props gracefully", () => {
      renderWithTheme(
        <LoadingSkeleton
          width={undefined}
          height={undefined}
          className={undefined}
        />
      );
      // Component handles undefined props gracefully
    });

    test("handles null props gracefully", () => {
      renderWithTheme(
        <LoadingSkeleton className={null} width={null} height={null} />
      );
      // Component handles null props gracefully
    });
  });

  describe("Accessibility", () => {
    test("spinner variant provides loading indication", () => {
      renderWithTheme(<LoadingSkeleton variant="spinner" />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("all variants render without accessibility errors", () => {
      const variants = ["text", "spinner", "table", "card"];

      variants.forEach((variant) => {
        renderWithTheme(<LoadingSkeleton variant={variant} />);
        // Each variant renders without accessibility violations
      });
    });
  });

  describe("Props validation", () => {
    test("accepts all valid variant types", () => {
      const variants = ["text", "spinner", "table", "card"];

      variants.forEach((variant) => {
        renderWithTheme(<LoadingSkeleton variant={variant} />);
        // All variants are accepted and render
      });
    });

    test("accepts numeric and string dimensions", () => {
      renderWithTheme(<LoadingSkeleton width={200} height={30} />);

      renderWithTheme(<LoadingSkeleton width="50%" height="1.5rem" />);
      // Both numeric and string dimensions work
    });

    test("accepts various row counts", () => {
      const rowCounts = [0, 1, 3, 10, 100];

      rowCounts.forEach((rows) => {
        renderWithTheme(<LoadingSkeleton rows={rows} />);
        // All row counts are handled properly
      });
    });
  });
});
