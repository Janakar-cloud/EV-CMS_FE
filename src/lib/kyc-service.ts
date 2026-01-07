import { apiClient } from './api-client';
import type { KYCDocument, KYCStatus, SubmitKYCRequest, VerifyKYCRequest } from '@/types/kyc';
import type { PaginatedResponse } from '@/types';

/**
 * KYC Service
 * Handles KYC document submission and verification
 */

const BASE_URL = '/kyc';

export const kycService = {
  /**
   * Get KYC status for current user
   */
  async getStatus(): Promise<KYCStatus> {
    return apiClient.get<KYCStatus>(`${BASE_URL}/status`);
  },

  /**
   * Submit KYC documents
   */
  async submitKYC(data: SubmitKYCRequest): Promise<KYCDocument> {
    return apiClient.post<KYCDocument>(`${BASE_URL}/submit`, data);
  },

  /**
   * Get all KYC submissions (Admin only)
   */
  async getSubmissions(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<KYCDocument>> {
    return apiClient.get<PaginatedResponse<KYCDocument>>(`${BASE_URL}/list`, { params });
  },

  /**
   * Get user KYC (Admin only)
   */
  async getUserKYC(userId: string): Promise<KYCDocument> {
    return apiClient.get<KYCDocument>(`${BASE_URL}/users/${userId}`);
  },

  /**
   * Verify KYC (Admin only)
   */
  async verifyKYC(userId: string, data: VerifyKYCRequest): Promise<KYCDocument> {
    return apiClient.put<KYCDocument>(`${BASE_URL}/users/${userId}/verify`, data);
  },
};
