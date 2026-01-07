/**
 * Rate Limiter using in-memory store
 * For production, consider using Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if a request should be allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Increment existing entry
    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    return false;
  }

  /**
   * Get current rate limit status
   */
  getStatus(key: string) {
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return {
        limit: this.maxRequests,
        current: 0,
        remaining: this.maxRequests,
        resetTime: now + this.windowMs,
      };
    }

    return {
      limit: this.maxRequests,
      current: entry.count,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string) {
    this.store.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup() {
    const now = Date.now();
    const expired: string[] = [];

    this.store.forEach((value, key) => {
      if (now > value.resetTime) {
        expired.push(key);
      }
    });

    expired.forEach(key => this.store.delete(key));
  }

  /**
   * Get store size
   */
  getSize(): number {
    return this.store.size;
  }
}

// Export singleton instance
export const apiRateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000')
);

export default RateLimiter;
