// Roaming Service - OCPI/OICP roaming management
import apiClient from './api-client';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

// Roaming Partner
export interface RoamingPartner {
  _id: string;
  name: string;
  partyId: string;
  countryCode: string;
  protocol: 'ocpi' | 'oicp';
  status: 'active' | 'pending' | 'suspended';
  endpoint: string;
  credentials?: {
    tokenA?: string;
    tokenB?: string;
    tokenC?: string;
  };
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

// Roaming Agreement
export interface RoamingAgreement {
  _id: string;
  partnerId: string;
  partnerName: string;
  type: 'emsp' | 'cpo' | 'bilateral';
  status: 'draft' | 'active' | 'expired' | 'terminated';
  startDate: string;
  endDate?: string;
  terms: {
    revenueSplit: number;
    minimumVolume?: number;
    tariffType: 'pass-through' | 'fixed' | 'markup';
    markupPercent?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Roaming Session
export interface RoamingSession {
  _id: string;
  sessionId: string;
  partnerId: string;
  partnerName: string;
  direction: 'inbound' | 'outbound';
  userId?: string;
  chargerId: string;
  chargerName?: string;
  startTime: string;
  endTime?: string;
  energyDelivered: number;
  cost: number;
  currency: string;
  status: 'active' | 'completed' | 'failed';
  cdrId?: string;
  settlementStatus: 'pending' | 'settled' | 'disputed';
}

// Settlement Record
export interface SettlementRecord {
  _id: string;
  partnerId: string;
  partnerName: string;
  period: {
    start: string;
    end: string;
  };
  sessions: number;
  totalEnergy: number;
  grossAmount: number;
  netAmount: number;
  commission: number;
  status: 'pending' | 'invoiced' | 'paid' | 'disputed';
  invoiceNumber?: string;
  paidAt?: string;
  createdAt: string;
}

// Filters
export interface RoamingPartnerFilters {
  status?: string;
  protocol?: string;
  page?: number;
  limit?: number;
}

export interface RoamingSessionFilters {
  partnerId?: string;
  direction?: 'inbound' | 'outbound';
  status?: string;
  settlementStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SettlementFilters {
  partnerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Response types
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

class RoamingService {
  private static readonly API_BASE = '/roaming';

  // ==================== Partners ====================

  async listPartners(filters?: RoamingPartnerFilters): Promise<PaginatedResponse<RoamingPartner>> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/partners`, { params: filters });
      const data = unwrap<any>(response);
      if (Array.isArray(data)) {
        return { data, total: data.length, page: 1, pages: 1 };
      }
      return {
        data: data.partners ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPartner(partnerId: string): Promise<RoamingPartner> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/partners/${partnerId}`);
      return unwrap<RoamingPartner>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPartner(data: Omit<RoamingPartner, '_id' | 'createdAt' | 'updatedAt'>): Promise<RoamingPartner> {
    try {
      const response = await apiClient.post(`${RoamingService.API_BASE}/partners`, data);
      return unwrap<RoamingPartner>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePartner(partnerId: string, data: Partial<RoamingPartner>): Promise<RoamingPartner> {
    try {
      const response = await apiClient.put(`${RoamingService.API_BASE}/partners/${partnerId}`, data);
      return unwrap<RoamingPartner>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async syncPartner(partnerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${RoamingService.API_BASE}/partners/${partnerId}/sync`, {});
      return unwrap(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Agreements ====================

  async listAgreements(filters?: { partnerId?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<RoamingAgreement>> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/agreements`, { params: filters });
      const data = unwrap<any>(response);
      if (Array.isArray(data)) {
        return { data, total: data.length, page: 1, pages: 1 };
      }
      return {
        data: data.agreements ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAgreement(agreementId: string): Promise<RoamingAgreement> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/agreements/${agreementId}`);
      return unwrap<RoamingAgreement>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAgreement(data: Omit<RoamingAgreement, '_id' | 'createdAt' | 'updatedAt'>): Promise<RoamingAgreement> {
    try {
      const response = await apiClient.post(`${RoamingService.API_BASE}/agreements`, data);
      return unwrap<RoamingAgreement>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAgreement(agreementId: string, data: Partial<RoamingAgreement>): Promise<RoamingAgreement> {
    try {
      const response = await apiClient.put(`${RoamingService.API_BASE}/agreements/${agreementId}`, data);
      return unwrap<RoamingAgreement>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Sessions ====================

  async listSessions(filters?: RoamingSessionFilters): Promise<PaginatedResponse<RoamingSession>> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/sessions`, { params: filters });
      const data = unwrap<any>(response);
      if (Array.isArray(data)) {
        return { data, total: data.length, page: 1, pages: 1 };
      }
      return {
        data: data.sessions ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSession(sessionId: string): Promise<RoamingSession> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/sessions/${sessionId}`);
      return unwrap<RoamingSession>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Settlements ====================

  async listSettlements(filters?: SettlementFilters): Promise<PaginatedResponse<SettlementRecord>> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/settlements`, { params: filters });
      const data = unwrap<any>(response);
      if (Array.isArray(data)) {
        return { data, total: data.length, page: 1, pages: 1 };
      }
      return {
        data: data.settlements ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSettlement(settlementId: string): Promise<SettlementRecord> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/settlements/${settlementId}`);
      return unwrap<SettlementRecord>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createSettlement(data: { partnerId: string; periodStart: string; periodEnd: string }): Promise<SettlementRecord> {
    try {
      const response = await apiClient.post(`${RoamingService.API_BASE}/settlements`, data);
      return unwrap<SettlementRecord>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markSettlementPaid(settlementId: string): Promise<SettlementRecord> {
    try {
      const response = await apiClient.put(`${RoamingService.API_BASE}/settlements/${settlementId}/paid`, {});
      return unwrap<SettlementRecord>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== Stats ====================

  async getRoamingStats(dateRange?: { startDate: string; endDate: string }): Promise<{
    totalPartners: number;
    activePartners: number;
    inboundSessions: number;
    outboundSessions: number;
    totalRevenue: number;
    pendingSettlements: number;
  }> {
    try {
      const response = await apiClient.get(`${RoamingService.API_BASE}/stats`, { params: dateRange });
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

const roamingService = new RoamingService();
export default roamingService;
