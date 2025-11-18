import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('should handle objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('user', initialValue));

    expect(result.current[0]).toEqual(initialValue);

    const updatedValue = { name: 'Jane', age: 25 };
    act(() => {
      result.current[1](updatedValue);
    });

    expect(result.current[0]).toEqual(updatedValue);
  });

  it('should remove item from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'value'));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBeUndefined();
    expect(localStorage.getItem('test-key')).toBeNull();
  });
});
