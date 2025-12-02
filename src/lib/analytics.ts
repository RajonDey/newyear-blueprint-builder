/**
 * Analytics wrapper for tracking user events
 * Supports Google Analytics 4
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const isProduction = import.meta.env.PROD;
const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-5XH8NVSDR6";

/**
 * Track a page view
 */
export function trackPageView(path: string) {
  if (!isProduction) return;

  // Google Analytics 4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  if (!isProduction) return;

  // Google Analytics 4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

/**
 * Track wizard step completion
 */
export function trackWizardStep(stepNumber: number, stepName: string) {
  trackEvent("wizard_step_completed", {
    step_number: stepNumber,
    step_name: stepName,
  });
}

/**
 * Track wizard completion
 */
export function trackWizardCompleted(timeSpent?: number) {
  trackEvent("wizard_completed", {
    time_spent_seconds: timeSpent,
  });
}

/**
 * Track PDF download
 */
export function trackPDFDownload() {
  trackEvent("pdf_downloaded");
}

/**
 * Track Notion template download
 */
export function trackNotionDownload() {
  trackEvent("notion_template_downloaded");
}

/**
 * Track payment initiation
 */
export function trackPaymentInitiated() {
  trackEvent("payment_initiated");
}

/**
 * Track payment success
 */
export function trackPaymentSuccess(amount?: number) {
  trackEvent("payment_success", {
    value: amount,
    currency: "USD",
  });
}

/**
 * Track payment cancellation
 */
export function trackPaymentCancelled() {
  trackEvent("payment_cancelled");
}

/**
 * Track conversion funnel step
 */
export function trackConversionStep(step: string) {
  trackEvent("conversion_step", { step });
}
