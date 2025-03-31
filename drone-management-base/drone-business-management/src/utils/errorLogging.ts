import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error logging with the provided DSN
 * @param dsn The Sentry DSN to use for error reporting
 */
export const initErrorLogging = (dsn: string): void => {
  Sentry.init({
    dsn,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',
  });
};

/**
 * Capture an error with additional context
 * @param error Error object
 * @param context Additional context data
 */
export const captureError = (error: Error, context?: Record<string, any>): void => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Track a custom message with additional data
 * @param message Message to log
 * @param data Additional data
 * @param level Sentry severity level
 */
export const logMessage = (
  message: string, 
  data?: Record<string, any>, 
  level: Sentry.SeverityLevel = 'info'
): void => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
};

/**
 * Create a bound function that automatically captures errors
 * @param fn Function to wrap with error capture
 * @param context Additional context to add to errors
 */
export const withErrorBoundary = <T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      captureError(error as Error, {
        ...context,
        arguments: args,
        functionName: fn.name,
      });
      throw error;
    }
  };
};

/**
 * Simple error analysis utility
 * @param error The error to analyze
 * @returns An object with analysis information
 */
export const analyzeError = (error: Error): { 
  rootCause: string; 
  potentialSolutions: string[];
} => {
  let rootCause = 'Unknown error';
  const potentialSolutions = [];

  if (error.message.includes('Cannot read property') || error.message.includes('Cannot read properties')) {
    rootCause = 'Attempting to access a property on an undefined or null object';
    potentialSolutions.push('Add null/undefined checks before accessing properties');
    potentialSolutions.push('Use optional chaining (obj?.prop) for safer property access');
  } else if (error.message.includes('is not a function')) {
    rootCause = 'Attempting to call something that is not a function';
    potentialSolutions.push('Check the type of the variable before calling it as a function');
    potentialSolutions.push('Ensure the function is properly imported and available in scope');
  } else if (error.stack?.includes('async') || error.stack?.includes('promise')) {
    rootCause = 'Error in asynchronous code';
    potentialSolutions.push('Add proper error handling to async/await blocks or Promises');
    potentialSolutions.push('Use try/catch to handle async errors gracefully');
  } else {
    potentialSolutions.push('Review the full error stack trace for more context');
    potentialSolutions.push('Check recent code changes that might have caused this error');
  }

  return {
    rootCause,
    potentialSolutions,
  };
};

/**
 * Generate a prompt to help fix the error
 * @param error The error to generate a fix prompt for
 * @returns A string with a prompt for fixing the error
 */
export const generateErrorFixPrompt = (error: Error): string => {
  return `I encountered this error in my React application:

Error: ${error.message}
Stack: ${error.stack}

Can you help me fix it? Here's what I've already tried:
- Checked for null/undefined values
- Verified component props
- Reviewed recent code changes`;
};

export default {
  initErrorLogging,
  captureError,
  logMessage,
  withErrorBoundary,
  analyzeError,
  generateErrorFixPrompt
}; 