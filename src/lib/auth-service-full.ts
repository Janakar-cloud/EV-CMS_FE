// Authentication Service - Full Implementation
// Replaces mock with real API integration

import { 
  AuthUser, 
  LoginCredentials, 
  AuthResponse, 
  OTPRequest, 
  OTPVerification, 
  OTPResponse, 
  PasswordReset, 
  LoginMethod,
  UserRole,
  SessionData 
} from '@/types/auth';
import apiClient from './api-client';

class AuthService {
  private static readonly API_BASE = '/api/v1/auth';
  private accessToken: string | null = null;
  private currentUser: AuthUser | null = null;

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: UserRole;
  }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(`${AuthService.API_BASE}/register`, data);
      
      if (response.data.success) {
        this.accessToken = response.data.data.accessToken;
        this.currentUser = response.data.data.user;
        if (this.accessToken) {
          localStorage.setItem('accessToken', this.accessToken);
        }
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login with email, phone, or username
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(`${AuthService.API_BASE}/login`, {
        identifier: credentials.identifier,
        password: credentials.password,
        loginMethod: credentials.loginMethod || 'email'
      });

      if (response.data.success) {
        this.accessToken = response.data.data.accessToken;
        this.currentUser = response.data.data.user;
        if (this.accessToken) {
          localStorage.setItem('accessToken', this.accessToken);
        }
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await apiClient.post(`${AuthService.API_BASE}/refresh-token`, {
        refreshToken
      });

      this.accessToken = response.data.data.accessToken;
      if (this.accessToken) {
        localStorage.setItem('accessToken', this.accessToken);
      }
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthUser> {
    try {
      const response = await apiClient.get(`${AuthService.API_BASE}/me`);
      
      if (response.data.success && response.data.data) {
        this.currentUser = response.data.data;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return this.currentUser as AuthUser;
      }

      throw new Error('Failed to fetch profile');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${AuthService.API_BASE}/forgot-password`, { email });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${AuthService.API_BASE}/reset-password`, {
        resetToken,
        newPassword,
        confirmPassword
      });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${AuthService.API_BASE}/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send OTP
   */
  async sendOTP(identifier: string, type: 'email' | 'phone' = 'email'): Promise<OTPResponse> {
    try {
      const response = await apiClient.post(`${AuthService.API_BASE}/send-otp`, {
        identifier,
        otpType: type === 'email' ? 'email_verification' : 'phone_verification'
      });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(identifier: string, otp: string, type: 'email' | 'phone' = 'email'): Promise<OTPVerification> {
    try {
      const response = await apiClient.post(`${AuthService.API_BASE}/verify-otp`, {
        identifier,
        otp,
        otpType: type === 'email' ? 'email_verification' : 'phone_verification'
      });

      if (response.data.success && response.data.data.accessToken) {
        this.accessToken = response.data.data.accessToken;
        this.currentUser = response.data.data.user;
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${AuthService.API_BASE}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.accessToken = null;
      this.currentUser = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  /**
   * Get current user (from memory or storage)
   */
  getCurrentUser(): AuthUser | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Check user role
   */
  hasRole(roles: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

const authService = new AuthService();
export default authService;
