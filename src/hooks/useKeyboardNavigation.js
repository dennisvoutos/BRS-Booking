import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook for implementing keyboard navigation in lists and arrays.
 * Provides arrow key navigation, Enter key selection, and Escape key reset
 * functionality with automatic event listener management and accessibility support.
 *
 * Features:
 * - Arrow key navigation (up/down) through array items
 * - Enter key selection with callback execution
 * - Escape key to clear selection
 * - Automatic boundary checking (no wrap-around)
 * - Enable/disable functionality for conditional usage
 * - Auto-reset selection when items array changes
 * - Proper event listener cleanup on unmount
 *
 * @param {Array} [items=[]] - Array of items to navigate through
 * @param {function} onSelect - Callback function called when an item is selected via Enter key
 * @param {boolean} [isEnabled=true] - Whether keyboard navigation is currently enabled
 * @returns {Object} Navigation state and control functions
 * @returns {number} returns.selectedIndex - Currently selected item index (-1 for no selection)
 * @returns {function} returns.setSelectedIndex - Function to manually set selected index
 *
 * @example
 * // Basic usage with search results
 * const searchResults = ['item1', 'item2', 'item3'];
 * const { selectedIndex, setSelectedIndex } = useKeyboardNavigation(
 *   searchResults,
 *   (selectedItem) => console.log('Selected:', selectedItem),
 *   true
 * );
 *
 * @example
 * // Usage with objects array
 * const bookings = [
 *   { id: '1', name: 'Booking 1' },
 *   { id: '2', name: 'Booking 2' }
 * ];
 * const { selectedIndex } = useKeyboardNavigation(
 *   bookings,
 *   (booking) => navigate(`/booking/${booking.id}`),
 *   isDropdownOpen
 * );
 */
export const useKeyboardNavigation = (
  items = [],
  onSelect,
  isEnabled = true
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (event) => {
      if (!isEnabled || items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            onSelect(items[selectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          setSelectedIndex(-1);
          break;
        default:
          break;
      }
    },
    [items, selectedIndex, onSelect, isEnabled]
  );

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown, isEnabled]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [items]);

  return {
    selectedIndex,
    setSelectedIndex,
  };
};
