import styles from "./App.module.css";
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
    <div className={styles.app}>
      <a href="#main-content" className={`${styles.skipLink} ${styles.srOnly}`}>
        Skip to main content
      </a>
      <header className={styles.appHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerBranding}>
            <h1>BRS Brokers</h1>
            <p>Vessel Booking Management System</p>
          </div>
          <ThemeToggle className={styles.headerToggle} />
        </div>
      </header>
      <main id="main-content" className={styles.mainContent}>
        <BookingsPage />
      </main>
    </div>
  );
}

export default App;
