import { renderHook, act } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";

describe("useKeyboardNavigation", () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let mockOnSelect;
  let testItems;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(document, "addEventListener");
    removeEventListenerSpy = jest.spyOn(document, "removeEventListener");
    mockOnSelect = jest.fn();
    testItems = ["item1", "item2", "item3"];
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe("Hook Initialization", () => {
    test("adds event listener when enabled", () => {
      renderHook(() => useKeyboardNavigation(testItems, mockOnSelect, true));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });

    test("does not add event listener when disabled", () => {
      renderHook(() => useKeyboardNavigation(testItems, mockOnSelect, false));

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    test("returns initial state", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      expect(result.current.selectedIndex).toBe(-1);
      expect(typeof result.current.setSelectedIndex).toBe("function");
    });

    test("removes event listener on unmount", () => {
      const { unmount } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });
  });

  describe("Keyboard Navigation", () => {
    test("handles ArrowDown key to move selection down", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      // Initially no selection
      expect(result.current.selectedIndex).toBe(-1);

      // Simulate ArrowDown key press
      fireEvent.keyDown(document, { key: "ArrowDown" });

      // Should move to first item
      expect(result.current.selectedIndex).toBe(0);
    });

    test("handles ArrowUp key to move selection up", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      // Set initial selection to second item
      act(() => {
        result.current.setSelectedIndex(1);
      });

      // Simulate ArrowUp key press
      fireEvent.keyDown(document, { key: "ArrowUp" });

      // Should move to first item
      expect(result.current.selectedIndex).toBe(0);
    });

    test("handles Enter key to select current item", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      // Set selection to first item
      act(() => {
        result.current.setSelectedIndex(0);
      });

      // Simulate Enter key press
      fireEvent.keyDown(document, { key: "Enter" });

      // Should call onSelect with the selected item
      expect(mockOnSelect).toHaveBeenCalledWith("item1");
    });

    test("handles Escape key to clear selection", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      // Set initial selection
      act(() => {
        result.current.setSelectedIndex(1);
      });
      expect(result.current.selectedIndex).toBe(1);

      // Simulate Escape key press
      fireEvent.keyDown(document, { key: "Escape" });

      // Should clear selection
      expect(result.current.selectedIndex).toBe(-1);
    });

    test("does not navigate beyond bounds", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      // Set selection to last item
      act(() => {
        result.current.setSelectedIndex(2);
      });

      // Try to go down beyond last item
      fireEvent.keyDown(document, { key: "ArrowDown" });

      // Should stay at last item
      expect(result.current.selectedIndex).toBe(2);

      // Set selection to first item
      act(() => {
        result.current.setSelectedIndex(0);
      });

      // Try to go up beyond first item
      fireEvent.keyDown(document, { key: "ArrowUp" });

      // Should stay at first item
      expect(result.current.selectedIndex).toBe(0);
    });

    test("ignores non-navigation keys", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      const initialIndex = result.current.selectedIndex;

      // Test various non-navigation keys
      fireEvent.keyDown(document, { key: "a" });
      fireEvent.keyDown(document, { key: "Tab" });
      fireEvent.keyDown(document, { key: "Shift" });

      // Selection should remain unchanged
      expect(result.current.selectedIndex).toBe(initialIndex);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    test("handles empty items array", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation([], mockOnSelect)
      );

      // Try to navigate with empty array
      fireEvent.keyDown(document, { key: "ArrowDown" });
      fireEvent.keyDown(document, { key: "Enter" });

      // Should not crash and not call onSelect
      expect(result.current.selectedIndex).toBe(-1);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    test("resets selection when items change", () => {
      let items = ["item1", "item2"];
      const { result, rerender } = renderHook(
        ({ items }) => useKeyboardNavigation(items, mockOnSelect),
        {
          initialProps: { items },
        }
      );

      // Set initial selection
      act(() => {
        result.current.setSelectedIndex(1);
      });
      expect(result.current.selectedIndex).toBe(1);

      // Change items
      items = ["newItem1", "newItem2", "newItem3"];
      rerender({ items });

      // Selection should be reset
      expect(result.current.selectedIndex).toBe(-1);
    });

    test("does not navigate when disabled", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect, false)
      );

      // Try to navigate while disabled
      fireEvent.keyDown(document, { key: "ArrowDown" });
      fireEvent.keyDown(document, { key: "Enter" });

      // Should not change selection or call onSelect
      expect(result.current.selectedIndex).toBe(-1);
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    test("handles Enter key with no selection", () => {
      renderHook(() => useKeyboardNavigation(testItems, mockOnSelect));

      // Try to select with no current selection (index -1)
      fireEvent.keyDown(document, { key: "Enter" });

      // Should not call onSelect
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    test("handles Enter key with invalid selection", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect)
      );

      // Set selection to invalid index
      act(() => {
        result.current.setSelectedIndex(99);
      });

      // Try to select with invalid index
      fireEvent.keyDown(document, { key: "Enter" });

      // Should not call onSelect
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("Event Listener Management", () => {
    test("updates event listener when isEnabled changes", () => {
      let isEnabled = true;
      const { rerender } = renderHook(() =>
        useKeyboardNavigation(testItems, mockOnSelect, isEnabled)
      );

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      // Disable navigation
      isEnabled = false;
      rerender();

      // Should remove event listener
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

      // Enable navigation again
      isEnabled = true;
      rerender();

      // Should add event listener again
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });
  });
});
