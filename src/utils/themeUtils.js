/**
 * Helper function to get themed class name
 * @param {string} baseClass - The base CSS class name
 * @param {string} currentTheme - The current theme ("light" or "dark")
 * @param {object} styles - The CSS modules styles object
 * @returns {string} - The combined class names
 */
export const getThemeClass = (baseClass, currentTheme, styles) => {
  return currentTheme === "light"
    ? `${styles[baseClass]} ${styles[`${baseClass}Light`] || ""}`
    : `${styles[baseClass]} ${styles[`${baseClass}Dark`] || ""}`;
};
