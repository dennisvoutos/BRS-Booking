/**
 * Comprehensive accessibility utility functions for enhanced user experience
 * and WCAG compliance. Provides focus management, screen reader support,
 * keyboard navigation, and accessibility feature detection.
 */

/**
 * Traps focus within a specified element, commonly used for modals and dialogs.
 * Automatically cycles focus between the first and last focusable elements.
 *
 * @param {HTMLElement} element - The container element to trap focus within
 * @returns {function} Cleanup function to remove event listeners
 *
 * @example
 * const modal = document.querySelector('.modal');
 * const cleanup = trapFocus(modal);
 * // Later, when modal closes:
 * cleanup();
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], input[type="date"], input[type="email"], input[type="password"], select, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  };

  element.addEventListener("keydown", handleTabKey);

  // Focus the first element
  if (firstFocusable) {
    firstFocusable.focus();
  }

  // Return cleanup function
  return () => {
    element.removeEventListener("keydown", handleTabKey);
  };
};

/**
 * Announces messages to screen readers using aria-live regions.
 * Creates temporary live regions for one-time announcements.
 *
 * @param {string} message - The message to announce to screen readers
 * @param {string} [priority="polite"] - The announcement priority ('polite' or 'assertive')
 *
 * @example
 * announceToScreenReader('Form submitted successfully');
 * announceToScreenReader('Error: Please fix validation errors', 'assertive');
 */
export const announceToScreenReader = (message, priority = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Generates unique IDs for form elements and accessibility purposes.
 * Ensures proper association between labels and form controls.
 */
let idCounter = 0;

/**
 * Generates a unique ID with an optional prefix.
 *
 * @param {string} [prefix="element"] - Prefix for the generated ID
 * @returns {string} Unique ID string
 *
 * @example
 * generateId('input') // Returns 'input-1'
 * generateId('modal') // Returns 'modal-2'
 */
export const generateId = (prefix = "element") => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

// Skip link functionality
export const createSkipLink = (targetId, text = "Skip to main content") => {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = "skip-link sr-only";
  skipLink.addEventListener("focus", () => {
    skipLink.classList.remove("sr-only");
  });
  skipLink.addEventListener("blur", () => {
    skipLink.classList.add("sr-only");
  });

  return skipLink;
};

/**
 * Checks if the keyboard event is Enter or Space key.
 * Commonly used for custom button implementations.
 *
 * @param {KeyboardEvent} event - The keyboard event to check
 * @returns {boolean} True if Enter or Space key was pressed
 */
export const isEnterOrSpace = (event) => {
  return event.key === "Enter" || event.key === " ";
};

export const isEscape = (event) => {
  return event.key === "Escape";
};

export const isTab = (event) => {
  return event.key === "Tab";
};

/**
 * Manages persistent ARIA live regions for consistent screen reader announcements.
 * Provides both polite and assertive announcement capabilities.
 */
class LiveRegionManager {
  constructor() {
    this.regions = new Map();
    this.createRegions();
  }

  createRegions() {
    // Create polite region
    const politeRegion = document.createElement("div");
    politeRegion.id = "aria-live-polite";
    politeRegion.setAttribute("aria-live", "polite");
    politeRegion.setAttribute("aria-atomic", "true");
    politeRegion.className = "sr-only";
    document.body.appendChild(politeRegion);
    this.regions.set("polite", politeRegion);

    // Create assertive region
    const assertiveRegion = document.createElement("div");
    assertiveRegion.id = "aria-live-assertive";
    assertiveRegion.setAttribute("aria-live", "assertive");
    assertiveRegion.setAttribute("aria-atomic", "true");
    assertiveRegion.className = "sr-only";
    document.body.appendChild(assertiveRegion);
    this.regions.set("assertive", assertiveRegion);
  }

  announce(message, priority = "polite") {
    const region = this.regions.get(priority);
    if (region) {
      // Clear previous message
      region.textContent = "";
      // Add new message after a brief delay to ensure it's announced
      setTimeout(() => {
        region.textContent = message;
      }, 100);
      // Clear message after announcement
      setTimeout(() => {
        region.textContent = "";
      }, 1000);
    }
  }
}

// Export singleton instance
export const liveRegionManager = new LiveRegionManager();

// High contrast mode detection
export const prefersHighContrast = () => {
  return window.matchMedia("(prefers-contrast: high)").matches;
};

// Reduced motion detection
export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Color contrast utilities
export const getContrastRatio = (color1, color2) => {
  // Simple contrast ratio calculation
  // In a real app, you'd want a more robust implementation
  const getLuminance = (color) => {
    // Simplified luminance calculation
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};
