import { describe, it, expect, vi } from 'vitest';
import {
  captureException,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
} from '@/lib/error-tracking';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  setContext: vi.fn(),
  init: vi.fn(),
  Replay: vi.fn(),
}));

describe('Error Tracking', () => {
  it('should capture exceptions', () => {
    const error = new Error('Test error');
    expect(() => {
      captureException(error, { test: true });
    }).not.toThrow();
  });

  it('should capture string errors', () => {
    expect(() => {
      captureException('String error message');
    }).not.toThrow();
  });

  it('should set user context', () => {
    expect(() => {
      setUserContext('user-123', 'user@example.com', 'John Doe');
    }).not.toThrow();
  });

  it('should clear user context', () => {
    expect(() => {
      clearUserContext();
    }).not.toThrow();
  });

  it('should add breadcrumb', () => {
    expect(() => {
      addBreadcrumb('Test breadcrumb', { data: 'value' });
    }).not.toThrow();
  });
});
