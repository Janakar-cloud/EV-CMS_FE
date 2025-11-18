import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/lib/auth-service';
import { LoginCredentials } from '@/types/auth';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials: LoginCredentials = {
        identifier: 'admin001',
        password: 'admin123',
        method: 'password',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user?.username).toBe('admin001');
    });

    it('should fail login with invalid credentials', async () => {
      const credentials: LoginCredentials = {
        identifier: 'invalid',
        password: 'wrong',
        method: 'password',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should handle email login', async () => {
      const credentials: LoginCredentials = {
        identifier: 'janakar.ganesan@gmail.com',
        password: 'admin123',
        method: 'password',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(true);
      expect(response.user?.email).toBe('janakar.ganesan@gmail.com');
    });
  });

  describe('sendOTP', () => {
    it('should send OTP to valid phone number', async () => {
      const response = await authService.sendOTP({
        phone: '+1234567890',
        type: 'login',
      });

      expect(response.success).toBe(true);
      expect(response.message).toContain('sent');
    });

    it('should send OTP to valid email', async () => {
      const response = await authService.sendOTP({
        email: 'janakar.ganesan@gmail.com',
        type: 'login',
      });

      expect(response.success).toBe(true);
      expect(response.message).toContain('sent');
    });
  });

  describe('verifyOTP', () => {
    it('should verify correct OTP', async () => {
      // First send OTP
      await authService.sendOTP({
        phone: '+1234567890',
        type: 'login',
      });

      // Then verify with correct OTP (123456 in mock)
      const response = await authService.verifyOTP({
        phone: '+1234567890',
        otp: '123456',
        type: 'login',
      });

      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user).toBeDefined();
    });

    it('should reject incorrect OTP', async () => {
      const response = await authService.verifyOTP({
        phone: '+1234567890',
        otp: '000000',
        type: 'login',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should reject expired OTP', async () => {
      // Simulate expired OTP scenario
      const response = await authService.verifyOTP({
        phone: '+9999999999',
        otp: '123456',
        type: 'login',
      });

      expect(response.success).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should validate valid token', async () => {
      // Login first to get token
      const loginResponse = await authService.login({
        identifier: 'admin001',
        password: 'admin123',
        method: 'password',
      });

      const token = loginResponse.token!;
      const checkResponse = await authService.checkAuth(token);

      expect(checkResponse.success).toBe(true);
      expect(checkResponse.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await authService.checkAuth('invalid-token');

      expect(response.success).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset OTP to email', async () => {
      const response = await authService.forgotPassword({
        email: 'janakar.ganesan@gmail.com',
      });

      expect(response.success).toBe(true);
      expect(response.message).toContain('sent');
    });

    it('should fail for non-existent email', async () => {
      const response = await authService.forgotPassword({
        email: 'nonexistent@example.com',
      });

      expect(response.success).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      // First request password reset
      await authService.forgotPassword({
        email: 'janakar.ganesan@gmail.com',
      });

      // Then reset with OTP
      const response = await authService.resetPassword({
        email: 'janakar.ganesan@gmail.com',
        otp: '123456',
        newPassword: 'newPassword123',
      });

      expect(response.success).toBe(true);
    });

    it('should fail with incorrect OTP', async () => {
      const response = await authService.resetPassword({
        email: 'janakar.ganesan@gmail.com',
        otp: '000000',
        newPassword: 'newPassword123',
      });

      expect(response.success).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Login first
      const loginResponse = await authService.login({
        identifier: 'admin001',
        password: 'admin123',
        method: 'password',
      });

      const token = loginResponse.token!;
      const response = await authService.logout(token);

      expect(response.success).toBe(true);
    });
  });
});
