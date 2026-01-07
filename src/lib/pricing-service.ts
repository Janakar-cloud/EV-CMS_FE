// Pricing Service - Complete CRUD with real API integration
import apiClient from './api-client';
import { PricingRule } from '@/types/pricing';

const unwrap = <T>(payload: any): T => (payload?.data?.data ?? payload?.data ?? payload) as T;

export interface PricingCalculateRequest {
  stationId: string;
  connectorType: string;
  energyKWh: number;
  durationMinutes: number;
  userSegment?: 'guest' | 'registered' | 'fleet' | 'employee' | 'resident';
}

export interface PricingCalculateResponse {
  baseAmount: number;
  energyCharge: number;
  timeCharge?: number;
  idleFee?: number;
  discount?: number;
  tax: number;
  totalAmount: number;
  currency: string;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

export interface PricingPreviewResponse {
  stationId: string;
  stationName: string;
  connectors: {
    type: string;
    pricePerKWh: number;
    pricePerMinute?: number;
    currency: string;
  }[];
  applicableRules: string[];
}

export interface PricingRulesFilters {
  page?: number;
  limit?: number;
  active?: boolean;
  scope?: string;
}

export interface PricingRulesListResponse {
  rules: PricingRule[];
  total: number;
  page: number;
  pages: number;
}

class PricingService {
  private static readonly API_BASE = '/pricing';

  /**
   * Calculate pricing for a charging session (public)
   */
  async calculatePrice(data: PricingCalculateRequest): Promise<PricingCalculateResponse> {
    try {
      const response = await apiClient.post(`${PricingService.API_BASE}/calculate`, data);
      return unwrap<PricingCalculateResponse>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get pricing preview for a station (public)
   */
  async getPricingPreview(stationId: string): Promise<PricingPreviewResponse> {
    try {
      const response = await apiClient.get(`${PricingService.API_BASE}/preview/${stationId}`);
      return unwrap<PricingPreviewResponse>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List all pricing rules (protected: admin|brand)
   */
  async listRules(filters?: PricingRulesFilters): Promise<PricingRulesListResponse> {
    try {
      const response = await apiClient.get(`${PricingService.API_BASE}/rules`, { params: filters });
      const data = unwrap<any>(response);
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        return { rules: data, total: data.length, page: 1, pages: 1 };
      }
      return {
        rules: data.rules ?? data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get pricing rule by ID (protected)
   */
  async getRule(id: string): Promise<PricingRule> {
    try {
      const response = await apiClient.get(`${PricingService.API_BASE}/rules/${id}`);
      return unwrap<PricingRule>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new pricing rule (protected: admin|brand)
   */
  async createRule(data: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingRule> {
    try {
      const response = await apiClient.post(`${PricingService.API_BASE}/rules`, data);
      return unwrap<PricingRule>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update pricing rule (protected: admin|brand)
   */
  async updateRule(id: string, data: Partial<PricingRule>): Promise<PricingRule> {
    try {
      const response = await apiClient.put(`${PricingService.API_BASE}/rules/${id}`, data);
      return unwrap<PricingRule>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete pricing rule (protected: admin|brand)
   */
  async deleteRule(id: string): Promise<void> {
    try {
      await apiClient.delete(`${PricingService.API_BASE}/rules/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ========================================
  // Legacy methods for backward compatibility
  // ========================================
  
  /**
   * @deprecated Use listRules() instead
   */
  async list(): Promise<PricingRule[]> {
    const response = await this.listRules();
    return response.rules;
  }

  /**
   * @deprecated Use getRule() instead
   */
  async get(id: string): Promise<PricingRule | undefined> {
    try {
      return await this.getRule(id);
    } catch {
      return undefined;
    }
  }

  /**
   * @deprecated Use createRule() instead
   */
  async create(rule: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingRule> {
    return this.createRule(rule);
  }

  /**
   * @deprecated Use updateRule() instead
   */
  async update(id: string, patch: Partial<PricingRule>): Promise<PricingRule | undefined> {
    try {
      return await this.updateRule(id, patch);
    } catch {
      return undefined;
    }
  }

  /**
   * @deprecated Use deleteRule() instead
   */
  async remove(id: string): Promise<boolean> {
    try {
      await this.deleteRule(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @deprecated No longer needed with backend API
   */
  seedIfEmpty(): void {
    // No-op - seeding is handled by backend
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

const pricingService = new PricingService();
export { pricingService };
export default pricingService;
