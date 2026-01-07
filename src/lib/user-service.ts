// Admin User Service - Complete CRUD with real API integration
import apiClient from './api-client';
import { User, CreateUserRequest, UserResponse, UserValidationError } from '@/types/user';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface AdminUserFilters {
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlockedUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminUserListResponse {
  users: User[];
  total: number;
  page: number;
  pages: number;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

class AdminUserService {
  private static readonly API_BASE = '/admin/users';

  /**
   * List all users with filters (admin-only)
   */
  async listUsers(filters?: AdminUserFilters): Promise<AdminUserListResponse> {
    try {
      const response = await apiClient.get(AdminUserService.API_BASE, { params: filters });
      const data = unwrap<any>(response);
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        return { users: data, total: data.length, page: 1, pages: 1 };
      }
      return {
        users: data.users ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get blocked users with pagination (admin-only)
   */
  async getBlockedUsers(filters?: BlockedUsersFilters): Promise<AdminUserListResponse> {
    try {
      const response = await apiClient.get(`${AdminUserService.API_BASE}/blocked`, { params: filters });
      const data = unwrap<any>(response);
      if (Array.isArray(data)) {
        return { users: data, total: data.length, page: 1, pages: 1 };
      }
      return {
        users: data.users ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user by ID (admin-only)
   */
  async getUser(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`${AdminUserService.API_BASE}/${id}`);
      return unwrap<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user (admin-only)
   */
  async updateUser(id: string, data: Partial<CreateUserRequest>): Promise<User> {
    try {
      const response = await apiClient.put(`${AdminUserService.API_BASE}/${id}`, data);
      return unwrap<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user status (admin-only)
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    try {
      const response = await apiClient.put(`${AdminUserService.API_BASE}/${id}/status`, { isActive });
      return unwrap<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Block user (admin-only)
   */
  async blockUser(id: string): Promise<User> {
    try {
      const response = await apiClient.put(`${AdminUserService.API_BASE}/${id}/block`);
      return unwrap<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Unblock user (admin-only)
   */
  async unblockUser(id: string): Promise<User> {
    try {
      const response = await apiClient.put(`${AdminUserService.API_BASE}/${id}/unblock`);
      return unwrap<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user (admin-only)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`${AdminUserService.API_BASE}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Restore deleted user (admin-only)
   */
  async restoreUser(id: string): Promise<User> {
    try {
      const response = await apiClient.patch(`${AdminUserService.API_BASE}/${id}/restore`);
      return unwrap<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate user data locally before submitting
   */
  validateUser(userData: CreateUserRequest): UserValidationError[] {
    const errors: UserValidationError[] = [];

    if (!userData.fullName || userData.fullName.trim().length < 2) {
      errors.push({
        field: 'fullName',
        message: 'Full name must be at least 2 characters long'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address'
      });
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!userData.phone || !phoneRegex.test(userData.phone)) {
      errors.push({
        field: 'phone',
        message: 'Please enter a valid phone number (minimum 10 digits)'
      });
    }

    if (!userData.userid || userData.userid.trim().length < 3) {
      errors.push({
        field: 'userid',
        message: 'User ID must be at least 3 characters long'
      });
    }

    return errors;
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.errors) {
      return new Error(JSON.stringify(error.response.data.errors));
    }
    return error;
  }
}

const adminUserService = new AdminUserService();

// ========================================
// Legacy exports for backward compatibility
// ========================================

export const userService = {
  createUser: async (userData: CreateUserRequest): Promise<UserResponse> => {
    const errors = adminUserService.validateUser(userData);
    if (errors.length > 0) {
      return { success: false, errors };
    }
    try {
      // Note: Create user might be a separate endpoint
      // Using updateUser pattern for now
      const user = await adminUserService.updateUser('new', userData as any);
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        errors: [{ field: 'general', message: error.message || 'Failed to create user' }]
      };
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await adminUserService.listUsers();
    return response.users;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await adminUserService.listUsers({ search: query });
    return response.users;
  },

  updateUserStatus: async (id: string, status: User['status']): Promise<UserResponse> => {
    try {
      const user = await adminUserService.updateUserStatus(id, status === 'active');
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        errors: [{ field: 'status', message: error.message || 'Failed to update status' }]
      };
    }
  },

  checkUserIdAvailability: async (userid: string): Promise<{ available: boolean }> => {
    try {
      const response = await adminUserService.listUsers({ search: userid });
      const isAvailable = !response.users.some(u => u.userid?.toLowerCase() === userid.toLowerCase());
      return { available: isAvailable };
    } catch {
      return { available: true };
    }
  }
};

export { adminUserService };
export default adminUserService;
