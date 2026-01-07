import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiRateLimiter, checkRateLimit, getRateLimitStatus } from '@/lib/api-rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear the rate limiter before each test
    vi.clearAllMocks();
  });

  it('should allow requests within the limit', () => {
    const result = checkRateLimit('/api/test', 'user1');
    expect(result).toBe(true);
  });

  it('should throw when rate limit is exceeded', () => {
    // Simulate exceeding the rate limit by making many requests
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    
    for (let i = 0; i < maxRequests; i++) {
      checkRateLimit('/api/test', 'user-limit-test');
    }

    // Next request should fail
    expect(() => {
      checkRateLimit('/api/test', 'user-limit-test');
    }).toThrow();
  });

  it('should return correct rate limit status', () => {
    checkRateLimit('/api/test', 'user2');
    
    const status = getRateLimitStatus('/api/test', 'user2');
    expect(status).toHaveProperty('limit');
    expect(status).toHaveProperty('current');
    expect(status).toHaveProperty('remaining');
    expect(status).toHaveProperty('resetTime');
  });

  it('should track separate limits per user', () => {
    checkRateLimit('/api/test', 'user3');
    checkRateLimit('/api/test', 'user4');

    const status3 = getRateLimitStatus('/api/test', 'user3');
    const status4 = getRateLimitStatus('/api/test', 'user4');

    expect(status3.current).toBe(status4.current);
  });
});
