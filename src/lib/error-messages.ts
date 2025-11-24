export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER: 'Server error. Please try again later.',
  STORAGE_FULL: 'Storage is full. Please clear browser data.',
  INVALID_INPUT: 'Please check your input and try again.',
  PDF_GENERATION: 'Failed to generate PDF. Please try again.',
  PAYMENT_VERIFICATION: 'Payment verification failed. Please contact support.',
  SESSION_EXPIRED: 'Your session has expired. Please start over.',
  GENERIC: 'Something went wrong. Please try again.',
  VALIDATION: 'Please complete all required fields.',
  GOAL_TOO_SHORT: 'Goal must be at least 10 characters.',
  GOAL_TOO_LONG: 'Goal exceeds maximum length.',
} as const;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Map specific error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK;
    }
    if (error.message.includes('timeout') || error.message.includes('abort')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    if (error.name === 'QuotaExceededError') {
      return ERROR_MESSAGES.STORAGE_FULL;
    }
    if (error.message.includes('PDF')) {
      return ERROR_MESSAGES.PDF_GENERATION;
    }
    if (error.message.includes('payment') || error.message.includes('verification')) {
      return ERROR_MESSAGES.PAYMENT_VERIFICATION;
    }

    // Return original error message if it's descriptive
    if (error.message.length > 10) {
      return error.message;
    }
  }

  return ERROR_MESSAGES.GENERIC;
};
