import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginCredentials } from '@/types/auth';

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: mockApiClient,
}));

import { authService } from '@/lib/auth-service';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    mockApiClient.get.mockReset();
    mockApiClient.post.mockReset();
    mockApiClient.put.mockReset();
    mockApiClient.patch.mockReset();
    mockApiClient.delete.mockReset();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '1',
            email: 'admin001@example.com',
          },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
        },
      });

      const credentials: LoginCredentials = {
        identifier: 'admin001@example.com',
        password: 'admin123',
        loginMethod: 'email',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user?.email).toBe('admin001@example.com');
    });

    it('should fail login with invalid credentials', async () => {
      const credentials: LoginCredentials = {
        identifier: 'invalid',
        password: 'wrong',
        loginMethod: 'username',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
    });

    it('should handle email login', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '2',
            email: 'janakar.ganesan@gmail.com',
          },
          token: 'mock-token-janakar',
          refreshToken: 'mock-refresh-token-janakar',
        },
      });

      const credentials: LoginCredentials = {
        identifier: 'janakar.ganesan@gmail.com',
        password: 'admin123',
        loginMethod: 'email',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(true);
      expect(response.user?.email).toBe('janakar.ganesan@gmail.com');
    });
  });

  describe('requestOTP', () => {
    it('should send OTP to valid phone number', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        message: 'OTP sent to phone',
      });

      const response = await authService.requestOTP({
        identifier: '+1234567890',
        type: 'login',
      });

      expect(response.success).toBe(true);
      expect(response.message).toContain('sent');
    });

    it('should send OTP to valid email', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        message: 'OTP sent to email',
      });

      const response = await authService.requestOTP({
        identifier: 'janakar.ganesan@gmail.com',
        type: 'login',
      });

      expect(response.success).toBe(true);
      expect(response.message).toContain('sent');
    });
  });

  describe('verifyOTP', () => {
    it('should verify correct OTP', async () => {
      mockApiClient.post
        .mockResolvedValueOnce({
          message: 'OTP sent',
        })
        .mockResolvedValueOnce({
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: '+1234567890',
          },
        });

      // First send OTP
      await authService.requestOTP({
        identifier: '+1234567890',
        type: 'login',
      });

      // Then verify with correct OTP (123456 in mock)
      const response = await authService.verifyOTP({
        identifier: '+1234567890',
        otp: '123456',
        type: 'login',
      });

      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
    });

    it('should reject incorrect OTP', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid or expired OTP'));

      const response = await authService.verifyOTP({
        identifier: '+1234567890',
        otp: '000000',
        type: 'login',
      });

      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
    });

    it('should reject expired OTP', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('OTP expired'));

      // Simulate expired OTP scenario
      const response = await authService.verifyOTP({
        identifier: '+9999999999',
        otp: '123456',
        type: 'login',
      });

      expect(response.success).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should validate valid token', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '1',
            email: 'admin001@example.com',
          },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
        },
      });

      mockApiClient.get.mockResolvedValueOnce({
        user: {
          id: '1',
          email: 'admin001@example.com',
        },
      });

      // Login first to get token
      const loginResponse = await authService.login({
        identifier: 'admin001@example.com',
        password: 'admin123',
        loginMethod: 'email',
      });

      const token = loginResponse.token!;
      const checkResponse = await authService.checkAuth(token);

      expect(checkResponse.success).toBe(true);
      expect(checkResponse.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Invalid token'));

      const response = await authService.checkAuth('invalid-token');

      expect(response.success).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      mockApiClient.post
        .mockResolvedValueOnce({
          message: 'OTP sent',
        })
        .mockResolvedValueOnce({
          message: 'Password reset successfully',
        });

      // First request password reset
      await authService.requestOTP({
        identifier: 'janakar.ganesan@gmail.com',
        type: 'password_reset',
      });

      // Then reset with OTP
      const response = await authService.resetPassword({
        identifier: 'janakar.ganesan@gmail.com',
        otp: '123456',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });

      expect(response.success).toBe(true);
    });

    it('should fail with incorrect OTP', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid OTP'));

      const response = await authService.resetPassword({
        identifier: 'janakar.ganesan@gmail.com',
        otp: '000000',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });

      expect(response.success).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockApiClient.post
        .mockResolvedValueOnce({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: '1',
              email: 'admin001@example.com',
            },
            token: 'mock-token',
            refreshToken: 'mock-refresh-token',
          },
        })
        .mockResolvedValueOnce({
          success: true,
        });

      // Login first
      const loginResponse = await authService.login({
        identifier: 'admin001@example.com',
        password: 'admin123',
        loginMethod: 'email',
      });

      const token = loginResponse.token!;
      const response = await authService.logout(token);

      expect(response.success).toBe(true);
    });
  });
});
