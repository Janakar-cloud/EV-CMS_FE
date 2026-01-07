// Admin Service - User and system management
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface AdminUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  chargers: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
  };
  sessions: {
    today: number;
    thisMonth: number;
    totalRevenue: number;
  };
  topStations: Array<{
    stationId: string;
    sessionCount: number;
    revenue: number;
  }>;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface BlockedUser {
  _id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  blockedAt: string;
  blockedReason?: string;
  blockedBy?: string;
}

export interface BlockedUsersResponse {
  users: BlockedUser[];
  total: number;
  page: number;
  pages: number;
}

export interface BlockedUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// KYC Types
export interface KYCDocument {
  type: 'aadhaar' | 'pan' | 'driving_license' | 'passport' | 'voter_id';
  documentNumber: string;
  frontImage?: string;
  backImage?: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface KYCUser {
  _id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  documents: KYCDocument[];
  submittedAt?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface KYCFilters {
  status?: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  page?: number;
  limit?: number;
  search?: string;
}

export interface KYCListResponse {
  users: KYCUser[];
  total: number;
  page: number;
  pages: number;
}

class AdminService {
  private static readonly API_BASE = '/admin';

  /**
   * List all users (admin only)
   */
  async listUsers(filters?: UserFilters): Promise<AdminUser[]> {
    try {
      const response = await apiClient.get(`${AdminService.API_BASE}/users`, { params: filters });
      const data = unwrap<any>(response);
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      }
      if (data?.users && Array.isArray(data.users)) {
        return data.users;
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || '';
      if (message.includes('Route not found') || message.includes('not found') || error.response?.status === 404) {
        console.warn('Admin users endpoint not available');
        return [];
      }
      throw this.handleError(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: Partial<AdminUser>) {
    try {
      const response = await apiClient.put(`${AdminService.API_BASE}/users/${userId}`, data);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    try {
      const response = await apiClient.delete(`${AdminService.API_BASE}/users/${userId}`);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Restore deleted user
   */
  async restoreUser(userId: string) {
    try {
      const response = await apiClient.post(`${AdminService.API_BASE}/users/${userId}/restore`, {});
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Block user (updated to use PUT as per new API)
   */
  async blockUser(userId: string, reason?: string) {
    try {
      const response = await apiClient.put(`${AdminService.API_BASE}/users/${userId}/block`, { reason });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Unblock user (updated to use PUT as per new API)
   */
  async unblockUser(userId: string) {
    try {
      const response = await apiClient.put(`${AdminService.API_BASE}/users/${userId}/unblock`, {});
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get blocked users list (NEW API)
   */
  async getBlockedUsers(filters?: BlockedUsersFilters): Promise<BlockedUsersResponse> {
    try {
      const response = await apiClient.get(`${AdminService.API_BASE}/users/blocked`, { params: filters });
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
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await apiClient.get(`${AdminService.API_BASE}/stats`);
      return unwrap(response);
    } catch (error: any) {
      // Handle missing route gracefully - return empty stats
      const message = error.response?.data?.message || error.message || '';
      if (message.includes('Route not found') || message.includes('not found') || error.response?.status === 404) {
        console.warn('Admin stats endpoint not available, returning empty stats');
        return {
          users: { total: 0, active: 0, inactive: 0 },
          chargers: { total: 0, online: 0, offline: 0, maintenance: 0 },
          sessions: { today: 0, thisMonth: 0, totalRevenue: 0 },
          topStations: []
        };
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get charger statistics
   */
  async getChargerStats() {
    try {
      const response = await apiClient.get(`${AdminService.API_BASE}/stats/chargers`);
      return unwrap(response);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || '';
      if (message.includes('Route not found') || message.includes('not found') || error.response?.status === 404) {
        console.warn('Charger stats endpoint not available');
        return { total: 0, online: 0, offline: 0, maintenance: 0 };
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(startDate?: string, endDate?: string) {
    try {
      const response = await apiClient.get(`${AdminService.API_BASE}/stats/sessions`, {
        params: { startDate, endDate }
      });
      return unwrap(response);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || '';
      if (message.includes('Route not found') || message.includes('not found') || error.response?.status === 404) {
        console.warn('Session stats endpoint not available');
        return { today: 0, thisMonth: 0, total: 0 };
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(startDate?: string, endDate?: string) {
    try {
      const response = await apiClient.get(`${AdminService.API_BASE}/stats/revenue`, {
        params: { startDate, endDate }
      });
      return unwrap(response);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || '';
      if (message.includes('Route not found') || message.includes('not found') || error.response?.status === 404) {
        console.warn('Revenue stats endpoint not available');
        return { totalRevenue: 0, thisMonth: 0, today: 0 };
      }
      throw this.handleError(error);
    }
  }


  // ==================== KYC Methods ====================
  // KYC endpoints are at /api/v1/kyc (NOT /api/v1/users)
  private static readonly KYC_BASE = '/kyc';

  /**
   * Get KYC pending/all users list
   */
  async getKYCUsers(filters?: KYCFilters): Promise<KYCListResponse> {
    try {
      const response = await apiClient.get(`${AdminService.KYC_BASE}/list`, { params: filters });
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
   * Get KYC details for a specific user
   */
  async getUserKYC(userId: string): Promise<KYCUser> {
    try {
      const response = await apiClient.get(`${AdminService.KYC_BASE}/users/${userId}`);
      return unwrap<KYCUser>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify/Approve KYC for a user
   */
  async verifyKYC(userId: string, notes?: string) {
    try {
      const response = await apiClient.put(`${AdminService.KYC_BASE}/users/${userId}/verify`, { notes });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reject KYC for a user
   */
  async rejectKYC(userId: string, reason: string) {
    try {
      const response = await apiClient.put(`${AdminService.KYC_BASE}/users/${userId}/reject`, { reason });
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user's KYC status (self-service)
   */
  async getMyKYCStatus() {
    try {
      const response = await apiClient.get(`${AdminService.KYC_BASE}/status`);
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit KYC documents (self-service)
   */
  async submitKYC(documents: any) {
    try {
      const response = await apiClient.post(`${AdminService.KYC_BASE}/submit`, documents);
      return unwrap(response);
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

const adminService = new AdminService();
export default adminService;
