/**
 * Error Handler Utility
 * Provides centralized error handling for API responses
 */

/**
 * Safely extract error message from various error formats
 * @param {any} error - Error object from catch block
 * @returns {Object} - { message: string, severity: string, statusCode: number }
 */
export const handleApiError = (error) => {
  // Default error response
  const defaultError = {
    message: 'An unexpected error occurred. Please try again later.',
    severity: 'error',
    statusCode: 500
  };

  // Handle null/undefined error
  if (!error) {
    return defaultError;
  }

  // Handle axios error with response
  if (error.response) {
    const { status, data } = error.response;

    // Handle different status codes
    switch (status) {
      case 400:
        return {
          message: data?.message || 'Invalid request. Please check your input.',
          severity: 'warning',
          statusCode: 400
        };
      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          severity: 'warning',
          statusCode: 401
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          severity: 'error',
          statusCode: 403
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          severity: 'info',
          statusCode: 404
        };
      case 500:
        return {
          message: 'Server error. Our team has been notified. Please try again later.',
          severity: 'error',
          statusCode: 500
        };
      case 502:
      case 503:
      case 504:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          severity: 'error',
          statusCode: status
        };
      default:
        return {
          message: data?.message || data?.error || `Request failed with status ${status}`,
          severity: 'error',
          statusCode: status
        };
    }
  }

  // Handle axios error without response (network error)
  if (error.request) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      severity: 'error',
      statusCode: 0
    };
  }

  // Handle custom error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred.',
      severity: 'error',
      statusCode: 0
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      severity: 'error',
      statusCode: 0
    };
  }

  // Handle object errors (non-standard format)
  if (typeof error === 'object') {
    return {
      message: error.message || error.error || defaultError.message,
      severity: 'error',
      statusCode: 0
    };
  }

  return defaultError;
};

/**
 * Log error to console with formatted output
 * @param {string} context - Where the error occurred
 * @param {any} error - The error object
 */
export const logError = (context, error) => {
  console.error(`[${context}] Error:`, {
    message: error?.message,
    statusCode: error?.response?.status,
    data: error?.response?.data,
    stack: error?.stack
  });
};

/**
 * Create a safe error response for service layer
 * @param {any} error - The error from API call
 * @returns {Object} - Safe error object with success: false
 */
export const createSafeErrorResponse = (error) => {
  const handledError = handleApiError(error);
  return {
    success: false,
    message: handledError.message,
    error: handledError,
    isServerError: handledError.statusCode === 500
  };
};

export default {
  handleApiError,
  logError,
  createSafeErrorResponse
};

