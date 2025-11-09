import { useState, useEffect } from "react";

/**
 * Custom hook for managing session storage with React state synchronization
 * Provides a way to store and retrieve data that persists only for the current browser session
 *
 * @param {string} key - The key to use for session storage
 * @param {any} defaultValue - The default value to return if no stored value exists
 * @returns {[any, function]} A tuple containing the current value and a setter function
 *
 * @example
 * // Track if user has seen welcome modal this session
 * const [hasSeenWelcome, setHasSeenWelcome] = useSessionStorage('hasSeenWelcome', false);
 *
 * @example
 * // Store user preferences for the session
 * const [preferences, setPreferences] = useSessionStorage('userPrefs', { theme: 'light' });
 */
export const useSessionStorage = (key, defaultValue) => {
  // Initialize state with value from session storage or default value
  const [value, setValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading session storage key "${key}":`, error);
      return defaultValue;
    }
  });

  /**
   * Update both state and session storage
   * @param {any} newValue - The new value to store (can be a function for functional updates)
   */
  const setStoredValue = (newValue) => {
    try {
      // Allow functional updates like regular useState
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;

      // Update state
      setValue(valueToStore);

      // Update session storage
      if (valueToStore === undefined || valueToStore === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting session storage key "${key}":`, error);
    }
  };

  // Listen for changes to session storage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.storageArea === sessionStorage) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue;
          setValue(newValue);
        } catch (error) {
          console.warn(
            `Error parsing session storage update for key "${key}":`,
            error
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, defaultValue]);

  return [value, setStoredValue];
};

/**
 * Hook specifically for managing the welcome modal state
 * Provides a more semantic interface for welcome modal functionality
 *
 * @returns {[boolean, function, function]} Returns [hasSeenWelcome, markWelcomeAsSeen, resetWelcome]
 *
 * @example
 * const [hasSeenWelcome, markWelcomeAsSeen, resetWelcome] = useWelcomeModal();
 *
 * // Show modal if user hasn't seen it
 * if (!hasSeenWelcome) {
 *   // Show welcome modal
 * }
 *
 * // Mark as seen when modal is closed
 * const handleCloseWelcome = () => {
 *   markWelcomeAsSeen();
 * };
 */
export const useWelcomeModal = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useSessionStorage(
    "brs_has_seen_welcome",
    false
  );

  const markWelcomeAsSeen = () => {
    setHasSeenWelcome(true);
  };

  const resetWelcome = () => {
    setHasSeenWelcome(false);
  };

  return [hasSeenWelcome, markWelcomeAsSeen, resetWelcome];
};

export default useSessionStorage;
