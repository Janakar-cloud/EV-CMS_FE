import { apiRateLimiter } from './rate-limiter';
import { captureException } from './error-tracking';

/**
 * Rate limit middleware for API calls
 * Tracks requests per endpoint to prevent abuse
 */
export class APIRateLimitError extends Error {
  constructor(
    public readonly resetTime: number,
    public readonly remaining: number
  ) {
    super(`Rate limit exceeded. Try again after ${new Date(resetTime).toISOString()}`);
    this.name = 'APIRateLimitError';
  }
}

/**
 * Check if an API request should be rate limited
 */
export function checkRateLimit(endpoint: string, userId?: string): boolean {
  // Create a unique key for the rate limiter
  const key = userId ? `${userId}:${endpoint}` : `anonymous:${endpoint}`;

  if (!apiRateLimiter.isAllowed(key)) {
    const status = apiRateLimiter.getStatus(key);
    const error = new APIRateLimitError(status.resetTime, status.remaining);
    captureException(error, { endpoint, userId });
    throw error;
  }

  return true;
}

/**
 * Get rate limit status for an endpoint
 */
export function getRateLimitStatus(endpoint: string, userId?: string) {
  const key = userId ? `${userId}:${endpoint}` : `anonymous:${endpoint}`;
  return apiRateLimiter.getStatus(key);
}

/**
 * Reset rate limit for a user
 */
export function resetRateLimit(endpoint: string, userId?: string) {
  const key = userId ? `${userId}:${endpoint}` : `anonymous:${endpoint}`;
  apiRateLimiter.reset(key);
}
