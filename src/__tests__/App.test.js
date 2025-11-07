import { render, screen } from "@testing-library/react";
import App from "../App";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";

test("renders BRS Brokers heading", () => {
  render(
    <ThemeProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  );
  const heading = screen.getByText(/BRS Brokers/i);
  expect(heading).toBeInTheDocument();
});
