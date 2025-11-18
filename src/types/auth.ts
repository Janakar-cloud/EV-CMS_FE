export type UserRole = 'admin' | 'franchise_owner' | 'partner';

export type LoginMethod = 'username' | 'email' | 'phone';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface LoginCredentials {
  identifier: string;
  password?: string;
  loginMethod: LoginMethod;
  rememberMe?: boolean;
}

export interface OTPRequest {
  identifier: string;
  type: 'login' | 'password_reset';
}

export interface OTPVerification {
  identifier: string;
  otp: string;
  type: 'login' | 'password_reset';
}

export interface PasswordReset {
  identifier: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
  errors?: AuthError[];
  requiresOTP?: boolean;
}

export interface AuthError {
  field: string;
  message: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresAt?: Date;
}

export interface SessionData {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

export type AuthFormType = 'login' | 'otp_login' | 'forgot_password' | 'otp_verify' | 'reset_password';

export interface LoginFormState {
  currentForm: AuthFormType;
  identifier: string;
  loginMethod: LoginMethod;
  otpType: 'login' | 'password_reset';
  isLoading: boolean;
  errors: Record<string, string>;
}
