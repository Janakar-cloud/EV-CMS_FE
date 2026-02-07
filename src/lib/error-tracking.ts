import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for error tracking
 * This should be called in middleware and layout components
 */
export function initializeSentry() {
  if (typeof window === 'undefined') {
    return; // Skip on server side
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
  });
}

/**
 * Capture an exception in Sentry
 */
export function captureException(error: Error | string, context?: Record<string, any>) {
  if (typeof error === 'string') {
    Sentry.captureMessage(error, 'error');
  } else {
    Sentry.captureException(error);
  }

  if (context) {
    Sentry.setContext('custom', context);
  }
}

/**
 * Capture a message in Sentry
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, name?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category: string = 'custom'
) {
  Sentry.addBreadcrumb({
    message,
    data,
    category,
    level: 'info',
  });
}

/**
 * Wrapper for API calls to track errors
 */
export async function trackAsyncOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    addBreadcrumb(`Started: ${operationName}`);
    const result = await operation();
    addBreadcrumb(`Completed: ${operationName}`);
    return result;
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      operation: operationName,
    });
    throw error;
  }
}
