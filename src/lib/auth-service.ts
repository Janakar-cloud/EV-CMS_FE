import { z } from 'zod';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Zod schemas for validation
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email, username, or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  loginMethod: z.enum(['email', 'username', 'phone']).optional()
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  fullName: z.string().min(2, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required')
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const otpLoginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')
});

// Token management utilities
const TokenManager = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
    }
  },

  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  },

  setUser: (user: AuthUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(user));
    }
  },

  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  }
};

// API client with auth header injection
const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = TokenManager.getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ? (options.headers as Record<string, string>) : {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle 401 - unauthorized (token expired or invalid)
    if (response.status === 401) {
      TokenManager.removeToken();
      // Trigger logout event for other tabs/windows
      window.dispatchEvent(new Event('logout'));
      throw new Error('Unauthorized. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    // Improve error message for common network issues
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Unable to connect to backend. ` +
        `API URL: ${API_URL} - ` +
        `Please ensure the backend service is running on http://localhost:5000`
      );
    }
    throw error;
  }
};

const authService = {
  /**
   * Login with email/username/phone and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const validated = loginSchema.parse(credentials);

      const identifier = validated.identifier.trim();
      const isEmail = validated.loginMethod === 'email' || identifier.includes('@');

      if (!isEmail) {
        throw new Error('Backend currently supports email/password login only. Please enter your email address.');
      }
      
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: identifier,
          password: validated.password
        })
      });

      // Backend shape: { success, message, data: { user, token, refreshToken } }
      if (response?.success === false) {
        return {
          success: false,
          message: response?.message || 'Login failed. Please try again.',
          errors: response?.errors || [{ field: 'general', message: response?.message || 'Login failed. Please try again.' }]
        };
      }

      const data = response?.data ?? response;
      const token: string | undefined = data?.token ?? data?.accessToken;
      const refreshToken: string | undefined = data?.refreshToken;
      const user = data?.user;

      if (!token || !user) {
        throw new Error(response?.message || 'Login response missing token/user.');
      }

      // Store tokens and user data
      TokenManager.setToken(token);
      if (refreshToken) TokenManager.setRefreshToken(refreshToken);
      TokenManager.setUser(user);

      return {
        success: true,
        user,
        token,
        message: response?.message || 'Login successful'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        errors: [{ 
          field: 'general', 
          message: error.message || 'Login failed. Please try again.' 
        }]
      };
    }
  },

  /**
   * Register a new account
   */
  register: async (data: any): Promise<AuthResponse> => {
    try {
      const validated = registerSchema.parse(data);
      
      const response = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: validated.email,
          username: validated.username,
          phone: validated.phone,
          fullName: validated.fullName,
          password: validated.password
        })
      });

      // Auto-login after registration
      if (response.token) {
        TokenManager.setToken(response.token);
      }
      if (response.refreshToken) {
        TokenManager.setRefreshToken(response.refreshToken);
      }
      if (response.user) {
        TokenManager.setUser(response.user);
      }

      return {
        success: true,
        user: response.user,
        token: response.token,
        message: 'Account created successfully'
      };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        errors: [{ 
          field: 'general', 
          message: error.message || 'Registration failed. Please try again.' 
        }]
      };
    }
  },

  /**
   * Request OTP for login or password reset
   */
  requestOTP: async (request: OTPRequest): Promise<OTPResponse> => {
    try {
      const validated = forgotPasswordSchema.parse({
        identifier: request.identifier
      });

      const response = await apiClient('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: validated.identifier,
          type: request.type
        })
      });

      return {
        success: true,
        message: response.message,
        expiresAt: response.expiresAt ? new Date(response.expiresAt) : new Date(Date.now() + 10 * 60 * 1000)
      };
    } catch (error: any) {
      console.error('Request OTP error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP. Please try again.'
      };
    }
  },

  /**
   * Verify OTP and login (for OTP-based login)
   */
  verifyOTP: async (verification: OTPVerification): Promise<AuthResponse> => {
    try {
      const validated = otpLoginSchema.parse({
        identifier: verification.identifier,
        otp: verification.otp
      });

      const response = await apiClient('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: validated.identifier,
          otp: validated.otp,
          type: verification.type
        })
      });

      if (verification.type === 'login') {
        // OTP login - user is authenticated
        if (response.token) {
          TokenManager.setToken(response.token);
        }
        if (response.refreshToken) {
          TokenManager.setRefreshToken(response.refreshToken);
        }
        if (response.user) {
          TokenManager.setUser(response.user);
        }

        return {
          success: true,
          user: response.user,
          token: response.token,
          message: 'Login successful'
        };
      } else {
        // OTP password reset - continue to password reset step
        return {
          success: true,
          message: 'OTP verified. Please set your new password.'
        };
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        errors: [{ 
          field: 'otp', 
          message: error.message || 'Invalid or expired OTP' 
        }]
      };
    }
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (resetData: PasswordReset): Promise<AuthResponse> => {
    try {
      const validated = resetPasswordSchema.parse(resetData);

      const response = await apiClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          identifier: validated.identifier,
          otp: validated.otp,
          newPassword: validated.newPassword
        })
      });

      return {
        success: true,
        message: 'Password reset successfully. Please login with your new password.'
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        errors: [{ 
          field: 'general', 
          message: error.message || 'Password reset failed. Please try again.' 
        }]
      };
    }
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        TokenManager.removeToken();
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      if (data.token) {
        TokenManager.setToken(data.token);
      }
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }

      return {
        success: true,
        token: data.token,
        message: 'Token refreshed'
      };
    } catch (error: any) {
      console.error('Refresh token error:', error);
      TokenManager.removeToken();
      return {
        success: false,
        message: 'Session expired. Please login again.'
      };
    }
  },

  /**
   * Verify current authentication status
   */
  checkAuth: async (token?: string): Promise<AuthResponse> => {
    try {
      const authToken = token || TokenManager.getToken();
      if (!authToken) {
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      const response = await apiClient('/auth/me', {
        method: 'GET'
      });

      return {
        success: true,
        user: response.user,
        message: 'Authenticated'
      };
    } catch (error: any) {
      console.error('Check auth error:', error);
      return {
        success: false,
        message: error.message || 'Authentication check failed'
      };
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<{ success: boolean }> => {
    try {
      await apiClient('/auth/logout', {
        method: 'POST'
      }).catch(() => {
        // Logout succeeds even if API call fails
      });

      TokenManager.removeToken();
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      TokenManager.removeToken();
      return { success: true };
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: (): AuthUser | null => {
    return TokenManager.getUser();
  },

  /**
   * Get current auth token
   */
  getToken: (): string | null => {
    return TokenManager.getToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return TokenManager.getToken() !== null;
  },

  /**
   * Check if user has specific role
   */
  hasRole: (role: UserRole): boolean => {
    const user = TokenManager.getUser();
    return user?.role === role;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<AuthUser>): Promise<AuthResponse> => {
    try {
      const response = await apiClient('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (response.user) {
        TokenManager.setUser(response.user);
      }

      return {
        success: true,
        user: response.user,
        message: 'Profile updated successfully'
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        errors: [{ 
          field: 'general', 
          message: error.message || 'Profile update failed' 
        }]
      };
    }
  },

  /**
   * Change user password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error: any) {
      console.error('Change password error:', error);
      return {
        success: false,
        errors: [{ 
          field: 'general', 
          message: error.message || 'Password change failed' 
        }]
      };
    }
  }
};

export { authService };
export default authService;
