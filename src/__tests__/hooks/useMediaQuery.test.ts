import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Mock window.matchMedia
const createMatchMedia = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
};

describe('useMediaQuery Hook', () => {
  it('should return true when media query matches', () => {
    window.matchMedia = createMatchMedia(true) as any;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when media query does not match', () => {
    window.matchMedia = createMatchMedia(false) as any;
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should detect mobile viewport', () => {
    window.matchMedia = createMatchMedia(true) as any;
    const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'));
    expect(result.current).toBe(true);
  });

  it('should detect desktop viewport', () => {
    window.matchMedia = createMatchMedia(true) as any;
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });
});
