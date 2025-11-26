/**
 * Central configuration for the application
 * Handles year detection and other app-wide settings
 */

/**
 * Gets the target year for planning.
 * Returns the next year if we're in Q4 (Oct-Dec), otherwise returns current year.
 * This ensures the app is ready for new year planning ahead of time.
 */
export function getTargetYear(): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12 (Jan-Dec)

  // If we're in Q4 (Oct, Nov, Dec), target next year
  if (month >= 10) {
    return currentYear + 1;
  }

  return currentYear;
}

/**
 * Gets the current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Gets the next year
 */
export function getNextYear(): number {
  return new Date().getFullYear() + 1;
}

/**
 * App configuration
 */
export const APP_CONFIG = {
  year: getTargetYear(),
  currentYear: getCurrentYear(),
  nextYear: getNextYear(),
  appName: "Year in Review",
  appDescription:
    "Free interactive goal-setting wizard using proven frameworks including Wheel of Life, SMART Goals, OKR, and Atomic Habits.",
  baseUrl: import.meta.env.VITE_APP_URL || "https://yearinreview.online",
} as const;

/**
 * Helper to get year-specific text
 */
export function getYearText(year?: number): string {
  return String(year || APP_CONFIG.year);
}

/**
 * Helper to get year-specific title
 */
export function getYearTitle(year?: number): string {
  const y = year || APP_CONFIG.year;
  return `${y} Blueprint Builder`;
}
