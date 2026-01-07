import { apiClient } from './api-client';
import type { User, UpdateProfileRequest, UpdatePreferencesRequest, UserPreferences } from '@/types/profile';

/**
 * User Profile Service
 * Handles user profile and preference management
 */

const BASE_URL = '/profile';

export const profileService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>(BASE_URL);
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.put<User>(BASE_URL, data);
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>(`${BASE_URL}/preferences`);
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    return apiClient.put<UserPreferences>(`${BASE_URL}/preferences`, data);
  },
};
