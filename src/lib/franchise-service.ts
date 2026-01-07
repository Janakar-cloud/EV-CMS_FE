// Franchise Service - Complete CRUD with real API integration
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface Franchise {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  chargerCount: number;
  stationCount: number;
  monthlyRevenue: number;
  commissionRate: number;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FranchiseStaff {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface FranchiseStats {
  totalRevenue: number;
  totalSessions: number;
  totalEnergy: number;
  activeChargers: number;
  averageRating: number;
  monthlyGrowth: number;
}

export interface FranchiseFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface CreateFranchiseRequest {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  commissionRate?: number;
}

export interface FranchiseListResponse {
  franchises: Franchise[];
  total: number;
  page: number;
  pages: number;
}

class FranchiseService {
  private static readonly API_BASE = '/franchises';

  /**
   * List all franchises with filters
   */
  async listFranchises(filters?: FranchiseFilters): Promise<FranchiseListResponse> {
    try {
      const response = await apiClient.get(FranchiseService.API_BASE, { params: filters });
      const data = unwrap<any>(response);
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        return { franchises: data, total: data.length, page: 1, pages: 1 };
      }
      return {
        franchises: data.franchises ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get franchise by ID
   */
  async getFranchise(id: string): Promise<Franchise> {
    try {
      const response = await apiClient.get(`${FranchiseService.API_BASE}/${id}`);
      return unwrap<Franchise>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new franchise (admin only)
   */
  async createFranchise(data: CreateFranchiseRequest): Promise<Franchise> {
    try {
      const response = await apiClient.post(FranchiseService.API_BASE, data);
      return unwrap<Franchise>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update franchise (admin only)
   */
  async updateFranchise(id: string, data: Partial<CreateFranchiseRequest>): Promise<Franchise> {
    try {
      const response = await apiClient.put(`${FranchiseService.API_BASE}/${id}`, data);
      return unwrap<Franchise>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete franchise (admin only)
   */
  async deleteFranchise(id: string): Promise<void> {
    try {
      await apiClient.delete(`${FranchiseService.API_BASE}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get franchise staff
   */
  async getFranchiseStaff(id: string): Promise<FranchiseStaff[]> {
    try {
      const response = await apiClient.get(`${FranchiseService.API_BASE}/${id}/staff`);
      return unwrap<FranchiseStaff[]>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get franchise statistics
   */
  async getFranchiseStats(id: string): Promise<FranchiseStats> {
    try {
      const response = await apiClient.get(`${FranchiseService.API_BASE}/${id}/stats`);
      return unwrap<FranchiseStats>(response);
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

const franchiseService = new FranchiseService();
export default franchiseService;
