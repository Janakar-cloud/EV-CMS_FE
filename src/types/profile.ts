// User Profile Type Definitions

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'brand' | 'admin';
  profilePicture?: string;
  isEmailVerified: boolean;
  status: 'active' | 'blocked' | 'suspended';
  vehicles: Vehicle[];
  wallet: Wallet;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  sms: SmsNotificationSettings;
  inApp: InAppNotificationSettings;
}

export interface EmailNotificationSettings {
  bookingConfirmation: boolean;
  sessionComplete: boolean;
  paymentReceipt: boolean;
  promotions: boolean;
}

export interface PushNotificationSettings {
  bookingReminder: boolean;
  sessionStart: boolean;
  lowBalance: boolean;
}

export interface SmsNotificationSettings {
  bookingConfirmation: boolean;
  paymentConfirmation: boolean;
}

export interface InAppNotificationSettings {
  all: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  profilePicture?: string;
}

export interface UpdatePreferencesRequest {
  notifications?: Partial<NotificationPreferences>;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
}

// Re-export from other files
export type { Vehicle } from './vehicle';
export type { Wallet } from './wallet';
