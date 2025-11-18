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

class AuthStorage {
  private users: AuthUser[] = [];
  private otpStorage: Map<string, { otp: string; expiresAt: Date; type: 'login' | 'password_reset' }> = new Map();
  private sessions: Map<string, SessionData> = new Map();
  private passwords: Map<string, string> = new Map();

  constructor() {
    const sampleUsers = [
      {
        id: '1',
        username: 'admin001',
        email: 'janakar.ganesan@gmail.com',
        phone: '+1234567890',
        fullName: 'System Administrator',
        role: 'admin' as UserRole,
        isActive: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2', 
        username: 'franchise001',
        email: 'franchise.owner@evcms.com',
        phone: '+1234567891',
        fullName: 'John Franchise Owner',
        role: 'franchise_owner' as UserRole,
        isActive: true,
        createdAt: new Date('2024-02-10')
      },
      {
        id: '3',
        username: 'partner001',
        email: 'partner@evcms.com', 
        phone: '+1234567892',
        fullName: 'Sarah Partner Manager',
        role: 'partner' as UserRole,
        isActive: true,
        createdAt: new Date('2024-03-05')
      }
    ];

    this.users = sampleUsers;

    this.passwords.set('1', 'admin123');
    this.passwords.set('2', 'franchise123');
    this.passwords.set('3', 'partner123');
  }

  findUserByIdentifier(identifier: string, loginMethod?: LoginMethod): AuthUser | null {
    const normalizedIdentifier = identifier.toLowerCase().trim();
    
    return this.users.find(user => {
      if (loginMethod === 'username') {
        return user.username.toLowerCase() === normalizedIdentifier;
      } else if (loginMethod === 'email') {
        return user.email.toLowerCase() === normalizedIdentifier;
      } else if (loginMethod === 'phone') {
        return user.phone === identifier.trim();
      } else {
        return (
          user.username.toLowerCase() === normalizedIdentifier ||
          user.email.toLowerCase() === normalizedIdentifier ||
          user.phone === identifier.trim()
        );
      }
    }) || null;
  }

  detectLoginMethod(identifier: string): LoginMethod {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

    if (emailRegex.test(identifier)) {
      return 'email';
    } else if (phoneRegex.test(identifier)) {
      return 'phone';
    } else {
      return 'username';
    }
  }

  verifyPassword(userId: string, password: string): boolean {
    const storedPassword = this.passwords.get(userId);
    return storedPassword === password;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  sendOTP(identifier: string, type: 'login' | 'password_reset'): OTPResponse {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    this.otpStorage.set(identifier, { otp, expiresAt, type });

    console.log(`ðŸ“§ OTP sent to ${identifier}: ${otp} (expires at ${expiresAt})`);

    return {
      success: true,
      message: `OTP sent to ${identifier}. Please check your ${identifier.includes('@') ? 'email' : 'SMS'}.`,
      expiresAt
    };
  }

  verifyOTP(identifier: string, otp: string, type: 'login' | 'password_reset'): boolean {
    const stored = this.otpStorage.get(identifier);
    
    if (!stored) return false;
    if (stored.type !== type) return false;
    if (stored.expiresAt < new Date()) {
      this.otpStorage.delete(identifier);
      return false;
    }
    if (stored.otp !== otp) return false;

    this.otpStorage.delete(identifier);
    return true;
  }

  createSession(user: AuthUser): string {
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log('ðŸ” Creating session for user:', user.username, 'expires:', expiresAt);
    this.sessions.set(token, {
      user: { ...user, lastLogin: new Date() },
      token,
      expiresAt
    });

    console.log('ðŸ” Session created, total sessions:', this.sessions.size);
    return token;
  }

  getSession(token: string): SessionData | null {
    console.log('ðŸ” getSession called with token:', token.substring(0, 20) + '...');
    const session = this.sessions.get(token);
    if (!session) {
      console.log('ðŸ” No session found for token');
      return null;
    }
    if (session.expiresAt < new Date()) {
      console.log('ðŸ” Session expired, removing:', session.expiresAt);
      this.sessions.delete(token);
      return null;
    }
    console.log('ðŸ” Session found and valid for user:', session.user.username);
    return session;
  }

  updatePassword(userId: string, newPassword: string): boolean {
    this.passwords.set(userId, newPassword);
    return true;
  }

  removeSession(token: string): boolean {
    return this.sessions.delete(token);
  }
}

const authStorage = new AuthStorage();

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const { identifier, password, loginMethod } = credentials;

          if (!identifier || !password) {
            resolve({
              success: false,
              errors: [{ field: 'general', message: 'Please provide login credentials' }]
            });
            return;
          }

          const detectedMethod = loginMethod || authStorage.detectLoginMethod(identifier);
          
          const user = authStorage.findUserByIdentifier(identifier, detectedMethod);
          
          if (!user) {
            resolve({
              success: false,
              errors: [{ field: 'identifier', message: 'Invalid login credentials' }]
            });
            return;
          }

          if (!user.isActive) {
            resolve({
              success: false,
              errors: [{ field: 'general', message: 'Account is deactivated. Please contact support.' }]
            });
            return;
          }

          if (!authStorage.verifyPassword(user.id, password)) {
            resolve({
              success: false,
              errors: [{ field: 'password', message: 'Invalid login credentials' }]
            });
            return;
          }

          const token = authStorage.createSession(user);

          resolve({
            success: true,
            user,
            token,
            message: 'Login successful'
          });
        } catch (error) {
          resolve({
            success: false,
            errors: [{ field: 'general', message: 'An error occurred during login' }]
          });
        }
      }, 800);
    });
  },

  requestOTP: async (request: OTPRequest): Promise<OTPResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { identifier, type } = request;

        if (!identifier) {
          resolve({
            success: false,
            message: 'Please provide email or phone number'
          });
          return;
        }

        if (type === 'login') {
          const user = authStorage.findUserByIdentifier(identifier);
          if (!user) {
            resolve({
              success: false,
              message: 'No account found with this identifier'
            });
            return;
          }
          if (!user.isActive) {
            resolve({
              success: false,
              message: 'Account is deactivated'
            });
            return;
          }
        }

        if (type === 'password_reset' && !identifier.includes('@')) {
          resolve({
            success: false,
            message: 'Password reset is only available via email'
          });
          return;
        }

        const result = authStorage.sendOTP(identifier, type);
        resolve(result);
      }, 500);
    });
  },

  verifyOTP: async (verification: OTPVerification): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { identifier, otp, type } = verification;

        if (!authStorage.verifyOTP(identifier, otp, type)) {
          resolve({
            success: false,
            errors: [{ field: 'otp', message: 'Invalid or expired OTP' }]
          });
          return;
        }

        if (type === 'login') {
          const user = authStorage.findUserByIdentifier(identifier);
          if (!user || !user.isActive) {
            resolve({
              success: false,
              errors: [{ field: 'general', message: 'Account not found or deactivated' }]
            });
            return;
          }

          const token = authStorage.createSession(user);
          resolve({
            success: true,
            user,
            token,
            message: 'OTP login successful'
          });
        } else {
          resolve({
            success: true,
            message: 'OTP verified. Please set your new password.'
          });
        }
      }, 500);
    });
  },

  resetPassword: async (resetData: PasswordReset): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { identifier, otp, newPassword, confirmPassword } = resetData;

        if (newPassword !== confirmPassword) {
          resolve({
            success: false,
            errors: [{ field: 'confirmPassword', message: 'Passwords do not match' }]
          });
          return;
        }

        if (newPassword.length < 6) {
          resolve({
            success: false,
            errors: [{ field: 'newPassword', message: 'Password must be at least 6 characters long' }]
          });
          return;
        }

        if (!authStorage.verifyOTP(identifier, otp, 'password_reset')) {
          resolve({
            success: false,
            errors: [{ field: 'otp', message: 'Invalid or expired OTP' }]
          });
          return;
        }

        const user = authStorage.findUserByIdentifier(identifier);
        if (!user) {
          resolve({
            success: false,
            errors: [{ field: 'general', message: 'User not found' }]
          });
          return;
        }

        authStorage.updatePassword(user.id, newPassword);

        resolve({
          success: true,
          message: 'Password reset successfully. Please login with your new password.'
        });
      }, 600);
    });
  },

  checkAuth: async (token: string): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const session = authStorage.getSession(token);
        if (session) {
          resolve({
            success: true,
            user: session.user,
            token: session.token
          });
        } else {
          resolve({
            success: false,
            message: 'Session expired'
          });
        }
      }, 200);
    });
  },

  logout: async (token: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        authStorage.removeSession(token);
        resolve({ success: true });
      }, 200);
    });
  }
};
