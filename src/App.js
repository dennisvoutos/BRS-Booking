import "./App.css";
import BookingsPage from "./components/BookingsPage/BookingsPage";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";

/**
 * Main App component that provides the overall layout and structure for the BRS Brokers
 * Vessel Booking Management System. Includes accessibility features like skip navigation
 * and semantic HTML structure with header and main content areas.
 *
 * @component
 * @returns {JSX.Element} The main application layout with header, navigation, and booking management interface
 *
 * @example
 * // App is typically rendered at the root level wrapped with providers
 * <ThemeProvider>
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 * </ThemeProvider>
 */
function App() {
  return (
    <div className="App">
      <a href="#main-content" className="skip-link sr-only">
        Skip to main content
      </a>
      <header className="App-header">
        <div className="header-content">
          <div className="header-branding">
            <h1>BRS Brokers</h1>
            <p>Vessel Booking Management System</p>
          </div>
          <ThemeToggle className="header-toggle" />
        </div>
      </header>
      <main id="main-content">
        <BookingsPage />
      </main>
    </div>
  );
}

export default App;
