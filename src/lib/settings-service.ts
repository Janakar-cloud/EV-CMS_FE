// Settings Service - System settings management
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface SystemSettings {
  // General settings
  siteName: string;
  siteDescription: string;
  defaultCurrency: string;
  defaultTimezone: string;
  sessionTimeout: number; // in minutes

  // Notification settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  maintenanceAlerts: boolean;
  revenueReports: boolean;

  // Security settings
  twoFactorAuth: boolean;
  passwordMinLength: number;
  passwordExpireDays: number;
  maxLoginAttempts: number;

  // Charging settings
  defaultPricingPlanId?: string;
  autoStartCharging: boolean;
  maxSessionDuration: number; // in minutes
  idleTimeout: number; // in minutes

  // Business settings
  taxRate: number;
  commissionRate: number;
  minWalletTopup: number;
  maxWalletTopup: number;

  // Metadata
  updatedAt?: string;
  updatedBy?: string;
}

export interface UpdateSettingsRequest {
  siteName?: string;
  siteDescription?: string;
  defaultCurrency?: string;
  defaultTimezone?: string;
  sessionTimeout?: number;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  maintenanceAlerts?: boolean;
  revenueReports?: boolean;
  twoFactorAuth?: boolean;
  passwordMinLength?: number;
  passwordExpireDays?: number;
  maxLoginAttempts?: number;
  defaultPricingPlanId?: string;
  autoStartCharging?: boolean;
  maxSessionDuration?: number;
  idleTimeout?: number;
  taxRate?: number;
  commissionRate?: number;
  minWalletTopup?: number;
  maxWalletTopup?: number;
}

// Default settings for fallback
export const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'EV CMS',
  siteDescription: 'EV Charging Management System',
  defaultCurrency: 'INR',
  defaultTimezone: 'Asia/Kolkata',
  sessionTimeout: 30,
  emailNotifications: true,
  smsNotifications: true,
  pushNotifications: false,
  maintenanceAlerts: true,
  revenueReports: true,
  twoFactorAuth: false,
  passwordMinLength: 8,
  passwordExpireDays: 90,
  maxLoginAttempts: 5,
  autoStartCharging: false,
  maxSessionDuration: 480,
  idleTimeout: 15,
  taxRate: 18,
  commissionRate: 10,
  minWalletTopup: 100,
  maxWalletTopup: 50000,
};

class SettingsService {
  private static readonly API_BASE = '/settings';

  /**
   * Get system settings (admin only)
   */
  async getSettings(): Promise<SystemSettings> {
    try {
      const response = await apiClient.get(SettingsService.API_BASE);
      const data = unwrap<Partial<SystemSettings>>(response);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_SETTINGS, ...data };
    } catch (error) {
      console.warn('Failed to fetch settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update system settings (admin only)
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<SystemSettings> {
    try {
      const response = await apiClient.put(SettingsService.API_BASE, data);
      const updated = unwrap<Partial<SystemSettings>>(response);
      return { ...DEFAULT_SETTINGS, ...updated };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset settings to defaults (admin only)
   */
  async resetToDefaults(): Promise<SystemSettings> {
    try {
      const response = await apiClient.put(SettingsService.API_BASE, DEFAULT_SETTINGS);
      return unwrap<SystemSettings>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const settingsService = new SettingsService();
export default settingsService;
