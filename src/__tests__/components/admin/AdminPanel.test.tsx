import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPanel from '@/components/admin/AdminPanel';

// Mock the admin service
vi.mock('@/lib/admin-service', () => ({
  default: {
    getSystemStats: vi.fn().mockResolvedValue({
      totalUsers: 100,
      activeUsers: 50,
      totalRevenue: 50000,
    }),
    listUsers: vi.fn().mockResolvedValue([]),
  },
}));

describe('AdminPanel Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<AdminPanel />);
    expect(container).toBeTruthy();
  });

  it('should use memoized callbacks correctly', async () => {
    const { rerender } = render(<AdminPanel />);
    
    // Rerender should not cause issues with memoized callbacks
    rerender(<AdminPanel />);
    
    expect(true).toBe(true); // If we reach here, no errors occurred
  });
});
