import { apiClient, type AxiosError } from './api-client';

// NOTE: Partners uses /api/partners (NOT /api/v1/partners)
const PARTNERS_BASE = '/api/partners';

// Mock data for development/demo purposes
const MOCK_SMART_PARTNERS: Partner[] = [
  {
    _id: 'partner-1',
    name: 'GridSync Solutions',
    email: 'contact@gridsync.com',
    phone: '+1-555-0101',
    country: 'USA',
    website: 'https://gridsync.com',
    type: 'roaming',
    status: 'active',
    description: 'Smart charging network operator',
    approvedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    _id: 'partner-2',
    name: 'ChargeHub International',
    email: 'partner@chargehub.io',
    phone: '+44-20-7946-0958',
    country: 'UK',
    website: 'https://chargehub.io',
    type: 'roaming',
    status: 'active',
    description: 'European charging network',
    approvedAt: new Date('2024-02-20'),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-20'),
  },
];

const MOCK_AFFILIATE_PARTNERS: Partner[] = [
  {
    _id: 'partner-3',
    name: 'TechCorp Energy',
    email: 'business@techcorp.com',
    phone: '+1-555-0202',
    country: 'USA',
    website: 'https://techcorp.com',
    type: 'network-operator',
    status: 'active',
    description: 'Energy distribution partner',
    approvedAt: new Date('2024-01-05'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    _id: 'partner-4',
    name: 'Green Energy Partners',
    email: 'hello@greenenergy.co',
    phone: '+49-30-12345678',
    country: 'Germany',
    website: 'https://greenenergy.co',
    type: 'network-operator',
    status: 'pending',
    description: 'Renewable energy provider',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

export interface PartnerRequest {
  name: string;
  email: string;
  country: string;
  website: string;
  type: 'franchise' | 'roaming' | 'network-operator';
  phone?: string;
  description?: string;
}

export interface Partner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  website: string;
  type: 'franchise' | 'roaming' | 'network-operator';
  status: 'pending' | 'active' | 'suspended';
  description?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerListResponse {
  partners: Partner[];
  total: number;
  page: number;
  pages: number;
}

export interface PartnerApprovalRequest {
  notes: string;
}

export interface PartnerRejectionRequest {
  reason: string;
}

class PartnerService {
  // Partners API is at /api/partners (not under /api/v1)
  private baseEndpoint = PARTNERS_BASE;

  /**
   * Create a new partner request
   */
  async createPartner(data: PartnerRequest): Promise<Partner> {
    try {
      const response = await apiClient.post<Partner>(this.baseEndpoint, data);
      return response;
    } catch (error) {
      console.error('Failed to create partner:', error);
      throw error;
    }
  }

  /**
   * Get all partners with optional filtering
   */
  async getPartners(options?: {
    status?: 'pending' | 'active' | 'suspended';
    type?: 'franchise' | 'roaming' | 'network-operator';
    page?: number;
    limit?: number;
  }): Promise<PartnerListResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.type) params.append('type', options.type);
      if (options?.page) params.append('page', String(options.page));
      if (options?.limit) params.append('limit', String(options.limit));

      const queryString = params.toString();
      const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

      const response = await apiClient.get<PartnerListResponse>(url);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;

      // If 404 or endpoint not available, return mock data for demo
      if (axiosError?.response?.status === 404 || !axiosError?.response) {
        console.warn('Partners endpoint not available, using mock data for demo');

        let mockData = [...MOCK_SMART_PARTNERS, ...MOCK_AFFILIATE_PARTNERS];

        if (options?.type === 'roaming') {
          mockData = mockData.filter(p => p.type === 'roaming');
        } else if (options?.type === 'network-operator') {
          mockData = mockData.filter(p => p.type === 'network-operator');
        } else if (options?.type === 'franchise') {
          mockData = mockData.filter(p => p.type === 'franchise');
        }

        if (options?.status) {
          mockData = mockData.filter(p => p.status === options.status);
        }

        return {
          partners: mockData,
          total: mockData.length,
          page: options?.page || 1,
          pages: 1,
        };
      }

      console.error('Failed to fetch partners:', error);
      throw error;
    }
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(partnerId: string): Promise<Partner> {
    try {
      const response = await apiClient.get<Partner>(`${this.baseEndpoint}/${partnerId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch partner ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Update partner details
   */
  async updatePartner(partnerId: string, data: Partial<PartnerRequest>): Promise<Partner> {
    try {
      const response = await apiClient.put<Partner>(`${this.baseEndpoint}/${partnerId}`, data);
      return response;
    } catch (error) {
      console.error(`Failed to update partner ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Approve a partner request (Admin only)
   */
  async approvePartner(partnerId: string, request: PartnerApprovalRequest): Promise<Partner> {
    try {
      const response = await apiClient.put<Partner>(
        `${this.baseEndpoint}/${partnerId}/approve`,
        request
      );
      return response;
    } catch (error) {
      console.error(`Failed to approve partner ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Reject a partner request (Admin only)
   */
  async rejectPartner(partnerId: string, request: PartnerRejectionRequest): Promise<Partner> {
    try {
      const response = await apiClient.put<Partner>(
        `${this.baseEndpoint}/${partnerId}/reject`,
        request
      );
      return response;
    } catch (error) {
      console.error(`Failed to reject partner ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke a partner (Admin only)
   */
  async revokePartner(partnerId: string): Promise<Partner> {
    try {
      const response = await apiClient.put<Partner>(`${this.baseEndpoint}/${partnerId}/revoke`);
      return response;
    } catch (error) {
      console.error(`Failed to revoke partner ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Reactivate a partner (Admin only)
   */
  async reactivatePartner(partnerId: string): Promise<Partner> {
    try {
      const response = await apiClient.put<Partner>(`${this.baseEndpoint}/${partnerId}/reactivate`);
      return response;
    } catch (error) {
      console.error(`Failed to reactivate partner ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Update partner status (Admin only)
   */
  async updatePartnerStatus(
    partnerId: string,
    status: 'pending' | 'active' | 'suspended'
  ): Promise<Partner> {
    try {
      const response = await apiClient.put<Partner>(`${this.baseEndpoint}/${partnerId}/status`, {
        status,
      });
      return response;
    } catch (error) {
      console.error(`Failed to update partner status ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a partner
   */
  async deletePartner(partnerId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `${this.baseEndpoint}/${partnerId}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to delete partner ${partnerId}:`, error);
      throw error;
    }
  }

  /**
   * Get partners by type
   */
  async getPartnersByType(type: 'franchise' | 'roaming' | 'network-operator'): Promise<Partner[]> {
    try {
      const response = await this.getPartners({ type });
      return response.partners;
    } catch (error) {
      console.error(`Failed to fetch ${type} partners:`, error);
      throw error;
    }
  }

  /**
   * Get pending partner requests
   */
  async getPendingPartners(): Promise<Partner[]> {
    try {
      const response = await this.getPartners({ status: 'pending' });
      return response.partners;
    } catch (error) {
      console.error('Failed to fetch pending partners:', error);
      throw error;
    }
  }

  /**
   * Get active partners
   */
  async getActivePartners(): Promise<Partner[]> {
    try {
      const response = await this.getPartners({ status: 'active' });
      return response.partners;
    } catch (error) {
      console.error('Failed to fetch active partners:', error);
      throw error;
    }
  }

  /**
   * Get partners that specifically host locations
   */
  async getLocationPartners(): Promise<Partner[]> {
    try {
      const response = await this.getPartners({ status: 'active', type: 'franchise' });
      return response.partners;
    } catch (error) {
      console.error('Failed to fetch location partners:', error);
      throw error;
    }
  }

  async getSmartPartners(status?: 'pending' | 'active' | 'suspended'): Promise<Partner[]> {
    try {
      const response = await this.getPartners({ type: 'roaming', status });
      return response.partners;
    } catch (error) {
      // Already handled in getPartners with mock data fallback
      console.error('Failed to fetch smart partners:', error);
      return status ? MOCK_SMART_PARTNERS.filter(p => p.status === status) : MOCK_SMART_PARTNERS;
    }
  }

  async getAffiliatePartners(status?: 'pending' | 'active' | 'suspended'): Promise<Partner[]> {
    try {
      const response = await this.getPartners({ type: 'network-operator', status });
      return response.partners;
    } catch (error) {
      // Already handled in getPartners with mock data fallback
      console.error('Failed to fetch affiliate partners:', error);
      return status
        ? MOCK_AFFILIATE_PARTNERS.filter(p => p.status === status)
        : MOCK_AFFILIATE_PARTNERS;
    }
  }

  /**
   * Search partners
   */
  async searchPartners(query: string): Promise<Partner[]> {
    try {
      const response = await apiClient.get<Partner[]>(`${this.baseEndpoint}/search`, {
        params: { q: query },
      });
      return response;
    } catch (error) {
      console.error('Failed to search partners:', error);
      throw error;
    }
  }

  /**
   * Get partner statistics
   */
  async getPartnerStats(): Promise<{
    totalPartners: number;
    activePartners: number;
    pendingPartners: number;
    suspendedPartners: number;
    partnersByType: {
      franchise: number;
      roaming: number;
      networkOperator: number;
    };
  }> {
    try {
      const response = await apiClient.get<any>(`${this.baseEndpoint}/stats`);
      return response;
    } catch (error) {
      console.error('Failed to fetch partner statistics:', error);
      throw error;
    }
  }

  private extractPartnerList(payload: any): Partner[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.partners)) return payload.partners;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  }
}

const partnerService = new PartnerService();
export { partnerService };
export default partnerService;
